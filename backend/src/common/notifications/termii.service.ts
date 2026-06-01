/**
 * Termii Notification Service
 *
 * Handles SMS and WhatsApp notifications via Termii API.
 * Docs: https://developer.termii.com
 *
 * Used for:
 *  - Worker assignment notifications
 *  - Trust score changes
 *  - Verification status updates
 *  - Emergency mobilisation alerts
 *
 * Graceful degradation: if TERMII_API_KEY is not configured,
 * notifications are logged but not sent — never hard-fails.
 */

import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { HttpService } from '@nestjs/axios'
import { firstValueFrom } from 'rxjs'

const TERMII_BASE = 'https://v3.api.termii.com/api'

export interface TermiiSendResult {
  sent: boolean
  messageId?: string
  status?: string
  error?: string
}

@Injectable()
export class TermiiService {
  private readonly logger = new Logger(TermiiService.name)

  constructor(
    private readonly config: ConfigService,
    private readonly http: HttpService,
  ) {}

  isConfigured(): boolean {
    return !!this.config.get('TERMII_API_KEY')
  }

  /**
   * Send an SMS via Termii
   */
  async sendSMS(to: string, message: string): Promise<TermiiSendResult> {
    const apiKey = this.config.get<string>('TERMII_API_KEY')
    if (!apiKey) {
      this.logger.warn({ to: this.maskPhone(to), message: message.slice(0, 40) }, 'termii_not_configured_sms_skipped')
      return { sent: false, error: 'TERMII_NOT_CONFIGURED' }
    }

    try {
      const { data } = await firstValueFrom(
        this.http.post(`${TERMII_BASE}/sms/send`, {
          to:      this.normalisePhone(to),
          from:    this.config.get<string>('TERMII_SENDER_ID') ?? 'TrustGrid',
          sms:     message,
          type:    'plain',
          channel: 'generic',
          api_key: apiKey,
        }),
      )

      this.logger.log({ to: this.maskPhone(to), messageId: data.message_id }, 'termii_sms_sent')
      return { sent: true, messageId: data.message_id, status: data.status ?? 'sent' }
    } catch (err: any) {
      const error = err?.response?.data?.message ?? err?.message ?? 'SMS_SEND_FAILED'
      this.logger.warn({ to: this.maskPhone(to), error }, 'termii_sms_failed')
      return { sent: false, error }
    }
  }

  /**
   * Send a WhatsApp message via Termii
   */
  async sendWhatsApp(to: string, message: string): Promise<TermiiSendResult> {
    const apiKey = this.config.get<string>('TERMII_API_KEY')
    if (!apiKey) {
      this.logger.warn({ to: this.maskPhone(to) }, 'termii_not_configured_whatsapp_skipped')
      return { sent: false, error: 'TERMII_NOT_CONFIGURED' }
    }

    try {
      const { data } = await firstValueFrom(
        this.http.post(`${TERMII_BASE}/sms/send`, {
          to:      this.normalisePhone(to),
          from:    this.config.get<string>('TERMII_WHATSAPP_SENDER') ?? 'TrustGrid',
          sms:     message,
          type:    'plain',
          channel: 'whatsapp',
          api_key: apiKey,
        }),
      )

      this.logger.log({ to: this.maskPhone(to), messageId: data.message_id }, 'termii_whatsapp_sent')
      return { sent: true, messageId: data.message_id, status: data.status ?? 'sent' }
    } catch (err: any) {
      const error = err?.response?.data?.message ?? err?.message ?? 'WHATSAPP_SEND_FAILED'
      this.logger.warn({ to: this.maskPhone(to), error }, 'termii_whatsapp_failed')
      return { sent: false, error }
    }
  }

  /**
   * Send to both SMS and WhatsApp simultaneously.
   * Returns as soon as either succeeds.
   */
  async sendMultiChannel(to: string, message: string): Promise<{ sms: TermiiSendResult; whatsapp: TermiiSendResult }> {
    const [sms, whatsapp] = await Promise.all([
      this.sendSMS(to, message),
      this.sendWhatsApp(to, message),
    ])
    return { sms, whatsapp }
  }

  // ── Pre-built message templates ──────────────────────────────────────────

  assignmentMessage(workerName: string, jobTitle: string, location: string, supervisorPhone: string): string {
    return [
      `Hello ${workerName}! 👋`,
      ``,
      `You have a new job assignment on TrustGrid:`,
      `📋 ${jobTitle}`,
      `📍 ${location}`,
      ``,
      `Contact supervisor: ${supervisorPhone}`,
      ``,
      `Reply YES to accept or NO to decline.`,
      ``,
      `Trusted People. Accountable Service. — TrustGrid`,
    ].join('\n')
  }

  verificationMessage(workerName: string, status: 'VERIFIED' | 'FAILED' | 'PENDING'): string {
    const messages: Record<string, string> = {
      VERIFIED: `Hello ${workerName}! ✅ Your identity has been verified on TrustGrid. You are now active in the workforce registry. — TrustGrid`,
      FAILED:   `Hello ${workerName}. Your identity verification on TrustGrid could not be confirmed. Please contact your institution administrator for assistance. — TrustGrid`,
      PENDING:  `Hello ${workerName}! Your identity verification is being processed. You will be notified once complete. — TrustGrid`,
    }
    return messages[status] ?? messages.PENDING
  }

  emergencyMessage(skill: string, location: string, institutionName: string): string {
    return [
      `🚨 URGENT: ${institutionName}`,
      ``,
      `Emergency ${skill} needed at:`,
      `📍 ${location}`,
      ``,
      `Please confirm your availability immediately.`,
      `Reply AVAILABLE to respond.`,
      ``,
      `TrustGrid Emergency Alert`,
    ].join('\n')
  }

  endorsementMessage(workerName: string, endorserName: string, institutionName: string): string {
    return `Hello ${workerName}! 🎉 ${endorserName} from ${institutionName} has endorsed you on TrustGrid. Your trust score has been updated. — TrustGrid`
  }

  // ── Utilities ────────────────────────────────────────────────────────────

  private normalisePhone(phone: string): string {
    // Strip leading 0, add Nigeria country code if no country code present
    const stripped = phone.replace(/\s+/g, '').replace(/^0/, '')
    if (stripped.startsWith('+')) return stripped.replace('+', '')
    if (stripped.startsWith('234')) return stripped
    return `234${stripped}`
  }

  private maskPhone(phone: string): string {
    if (phone.length <= 6) return '****'
    return phone.slice(0, 6) + '****'
  }
}
