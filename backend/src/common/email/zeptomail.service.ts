import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import axios from 'axios'

interface SendEmailParams {
  to: string
  toName?: string
  subject: string
  htmlBody: string
  textBody?: string
}

@Injectable()
export class ZeptomailService {
  private readonly logger = new Logger(ZeptomailService.name)
  private readonly apiUrl = 'https://api.zeptomail.com/v1.1/email'

  constructor(private readonly config: ConfigService) {}

  isConfigured(): boolean {
    return !!this.config.get('ZEPTOMAIL_API_KEY')
  }

  async sendEmail(params: SendEmailParams): Promise<boolean> {
    const apiKey = this.config.get<string>('ZEPTOMAIL_API_KEY')
    const fromEmail = this.config.get<string>('ZEPTOMAIL_FROM_EMAIL') ?? 'noreply@trustgrid.ng'
    const fromName = this.config.get<string>('ZEPTOMAIL_FROM_NAME') ?? 'TrustGrid'

    if (!apiKey) {
      this.logger.warn({ to: params.to, subject: params.subject }, 'zeptomail_not_configured_skipping')
      return false
    }

    try {
      await axios.post(
        this.apiUrl,
        {
          from: { address: fromEmail, name: fromName },
          to: [{ email_address: { address: params.to, name: params.toName ?? params.to } }],
          subject: params.subject,
          htmlbody: params.htmlBody,
          ...(params.textBody && { textbody: params.textBody }),
        },
        {
          headers: {
            'Authorization': `Zoho-enczapikey ${apiKey}`,
            'Content-Type': 'application/json',
          },
          timeout: 10000,
        },
      )
      this.logger.log({ to: params.to, subject: params.subject }, 'email_sent')
      return true
    } catch (err: any) {
      this.logger.error({ err: err?.response?.data ?? err?.message, to: params.to }, 'zeptomail_send_failed')
      return false
    }
  }

  // ── Templated emails ────────────────────────────────────────────────────────

  async sendWelcome(params: { to: string; firstName: string; communityName: string; passportCode?: string }) {
    return this.sendEmail({
      to: params.to,
      toName: params.firstName,
      subject: `Welcome to ${params.communityName} — Your TrustGrid passport is ready`,
      htmlBody: `
        <div style="font-family:Inter,Arial,sans-serif;max-width:600px;margin:0 auto;background:#fff;">
          <div style="background:linear-gradient(135deg,#4F46E5,#0D9488);padding:32px 40px;border-radius:16px 16px 0 0;">
            <h1 style="color:#fff;margin:0;font-size:24px;font-weight:900;">Welcome to TrustGrid</h1>
            <p style="color:rgba(255,255,255,0.8);margin:8px 0 0;font-size:14px;">${params.communityName}</p>
          </div>
          <div style="padding:32px 40px;">
            <p style="font-size:16px;color:#1e293b;">Hi <strong>${params.firstName}</strong>,</p>
            <p style="color:#64748b;line-height:1.6;">You have been successfully onboarded to <strong>${params.communityName}</strong> on TrustGrid — the community trust infrastructure platform.</p>
            ${params.passportCode ? `
            <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:20px;margin:24px 0;text-align:center;">
              <p style="margin:0 0 4px;font-size:12px;color:#94a3b8;text-transform:uppercase;letter-spacing:0.1em;font-weight:700;">Your Trust Passport Code</p>
              <p style="margin:0;font-size:28px;font-weight:900;font-family:monospace;color:#1e293b;">${params.passportCode}</p>
              <a href="https://verify.trustgrid.ng/${params.passportCode}" style="display:inline-block;margin-top:12px;background:linear-gradient(135deg,#4F46E5,#0D9488);color:#fff;text-decoration:none;padding:10px 20px;border-radius:8px;font-size:13px;font-weight:700;">View Public Passport →</a>
            </div>
            ` : ''}
            <p style="color:#64748b;font-size:14px;">Complete your identity verification to unlock opportunities in your community.</p>
          </div>
          <div style="padding:20px 40px;border-top:1px solid #f1f5f9;text-align:center;">
            <p style="margin:0;font-size:12px;color:#94a3b8;">Powered by TrustGrid · <a href="https://trustgrid.ng" style="color:#6366f1;">trustgrid.ng</a></p>
          </div>
        </div>
      `,
      textBody: `Welcome to ${params.communityName} on TrustGrid, ${params.firstName}! ${params.passportCode ? `Your Trust Passport code: ${params.passportCode}` : ''}`,
    })
  }

  async sendVerificationComplete(params: { to: string; firstName: string; communityName: string; trustGrade: string; trustScore: number }) {
    return this.sendEmail({
      to: params.to,
      toName: params.firstName,
      subject: `Identity verified — Trust grade: ${params.trustGrade}`,
      htmlBody: `
        <div style="font-family:Inter,Arial,sans-serif;max-width:600px;margin:0 auto;">
          <div style="background:linear-gradient(135deg,#059669,#0D9488);padding:32px 40px;border-radius:16px 16px 0 0;">
            <h1 style="color:#fff;margin:0;font-size:22px;font-weight:900;">✓ Identity Verified</h1>
          </div>
          <div style="padding:32px 40px;">
            <p style="font-size:16px;color:#1e293b;">Hi <strong>${params.firstName}</strong>,</p>
            <p style="color:#64748b;line-height:1.6;">Your identity has been verified on TrustGrid. Your current trust grade is <strong style="color:#059669;">${params.trustGrade} (${params.trustScore})</strong>.</p>
            <p style="color:#64748b;font-size:14px;">You can now apply for trust-gated opportunities in ${params.communityName}.</p>
          </div>
          <div style="padding:20px 40px;border-top:1px solid #f1f5f9;text-align:center;">
            <p style="margin:0;font-size:12px;color:#94a3b8;">Powered by TrustGrid · <a href="https://trustgrid.ng" style="color:#6366f1;">trustgrid.ng</a></p>
          </div>
        </div>
      `,
    })
  }

  async sendOpportunityAlert(params: { to: string; firstName: string; opportunityTitle: string; communityName: string; opportunityId: string }) {
    return this.sendEmail({
      to: params.to,
      toName: params.firstName,
      subject: `New opportunity: ${params.opportunityTitle}`,
      htmlBody: `
        <div style="font-family:Inter,Arial,sans-serif;max-width:600px;margin:0 auto;">
          <div style="background:linear-gradient(135deg,#4F46E5,#7C3AED);padding:32px 40px;border-radius:16px 16px 0 0;">
            <h1 style="color:#fff;margin:0;font-size:22px;font-weight:900;">New Opportunity Available</h1>
            <p style="color:rgba(255,255,255,0.8);margin:8px 0 0;font-size:14px;">${params.communityName}</p>
          </div>
          <div style="padding:32px 40px;">
            <p style="font-size:16px;color:#1e293b;">Hi <strong>${params.firstName}</strong>,</p>
            <p style="color:#64748b;line-height:1.6;">A new opportunity matching your trust profile is available in <strong>${params.communityName}</strong>:</p>
            <div style="background:#f8fafc;border-left:4px solid #4F46E5;padding:16px 20px;margin:20px 0;border-radius:0 8px 8px 0;">
              <p style="margin:0;font-size:18px;font-weight:700;color:#1e293b;">${params.opportunityTitle}</p>
            </div>
            <a href="https://app.trustgrid.ng/opportunities/${params.opportunityId}" style="display:inline-block;background:linear-gradient(135deg,#4F46E5,#0D9488);color:#fff;text-decoration:none;padding:12px 24px;border-radius:10px;font-weight:700;font-size:14px;">View & Apply →</a>
          </div>
          <div style="padding:20px 40px;border-top:1px solid #f1f5f9;text-align:center;">
            <p style="margin:0;font-size:12px;color:#94a3b8;">Powered by TrustGrid · <a href="https://trustgrid.ng" style="color:#6366f1;">trustgrid.ng</a></p>
          </div>
        </div>
      `,
    })
  }
}
