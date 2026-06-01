/**
 * BillingService — Paystack Integration
 *
 * Handles all payment flows for TrustGrid:
 *
 * 1. Institution Subscriptions
 *    - Starter:      ₦15,000/month (up to 50 workers)
 *    - Growth:       ₦45,000/month (up to 250 workers)
 *    - Professional: ₦120,000/month (up to 1,000 workers)
 *    - Recurring via Paystack Plans + Subscriptions
 *
 * 2. Worker Verification Fees (one-time)
 *    - Basic (NIN):          ₦5,000
 *    - Standard (NIN+Face):  ₦12,000
 *    - Professional:         ₦25,000
 *
 * 3. Convention/Event Module (one-time per event)
 *    - Small (≤100 workers):  ₦150,000
 *    - Medium (≤500 workers): ₦400,000
 *    - Large (≤2000 workers): ₦1,200,000
 *
 * All amounts in Paystack are in kobo (₦1 = 100 kobo).
 * Paystack docs: https://paystack.com/docs/api
 */

import { Injectable, Logger, BadRequestException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { HttpService } from '@nestjs/axios'
import { firstValueFrom } from 'rxjs'
import { PrismaService } from '../../prisma/prisma.service'

const PAYSTACK_BASE = 'https://api.paystack.co'

// Subscription plan amounts in KOBO (multiply NGN by 100)
export const PLANS = {
  starter:      { name: 'TrustGrid Starter',      amount: 1_500_000,  interval: 'monthly', maxWorkers: 50 },
  growth:       { name: 'TrustGrid Growth',        amount: 4_500_000,  interval: 'monthly', maxWorkers: 250 },
  professional: { name: 'TrustGrid Professional',  amount: 12_000_000, interval: 'monthly', maxWorkers: 1000 },
  enterprise:   { name: 'TrustGrid Enterprise',    amount: 0,          interval: 'monthly', maxWorkers: -1 },  // custom pricing
}

// One-time verification fees in KOBO
export const VERIFICATION_FEES = {
  basic:        { name: 'Basic Verification (NIN)',           amount: 500_000 },   // ₦5,000
  standard:     { name: 'Standard Verification (NIN+Face)',   amount: 1_200_000 }, // ₦12,000
  professional: { name: 'Professional Verification',          amount: 2_500_000 }, // ₦25,000
}

// Event module fees in KOBO
export const EVENT_FEES = {
  small:  { name: 'Convention Module — Small (≤100)',    amount: 15_000_000 },  // ₦150,000
  medium: { name: 'Convention Module — Medium (≤500)',   amount: 40_000_000 },  // ₦400,000
  large:  { name: 'Convention Module — Large (≤2000)',   amount: 120_000_000 }, // ₦1,200,000
}

export interface InitiatePaymentDto {
  email: string
  amount: number        // in kobo
  reference?: string
  metadata?: Record<string, unknown>
  callbackUrl?: string
}

export interface PaymentVerificationResult {
  success: boolean
  reference: string
  amount: number        // in kobo
  status: string
  paidAt?: Date
  channel?: string
  currency?: string
  metadata?: Record<string, unknown>
}

@Injectable()
export class BillingService {
  private readonly logger = new Logger(BillingService.name)

  constructor(
    private readonly config: ConfigService,
    private readonly http: HttpService,
    private readonly prisma: PrismaService,
  ) {}

  private get headers() {
    const key = this.config.get<string>('PAYSTACK_SECRET_KEY')
    if (!key) throw new BadRequestException('Paystack not configured. Set PAYSTACK_SECRET_KEY.')
    return { Authorization: `Bearer ${key}` }
  }

  isConfigured(): boolean {
    return !!this.config.get('PAYSTACK_SECRET_KEY')
  }

  // ── Initialize a one-time payment ────────────────────────────────────────

  async initializePayment(dto: InitiatePaymentDto) {
    const reference = dto.reference ?? `tg_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`

    const { data } = await firstValueFrom(
      this.http.post(`${PAYSTACK_BASE}/transaction/initialize`, {
        email: dto.email,
        amount: dto.amount,
        reference,
        metadata: dto.metadata ?? {},
        callback_url: dto.callbackUrl ?? this.config.get('PAYSTACK_CALLBACK_URL'),
        currency: 'NGN',
      }, { headers: this.headers }),
    )

    this.logger.log({ reference, amount: dto.amount / 100 }, 'paystack_payment_initialized')

    return {
      authorizationUrl: data.data.authorization_url,
      accessCode:       data.data.access_code,
      reference:        data.data.reference,
    }
  }

  // ── Verify a payment ─────────────────────────────────────────────────────

  async verifyPayment(reference: string): Promise<PaymentVerificationResult> {
    const { data } = await firstValueFrom(
      this.http.get(`${PAYSTACK_BASE}/transaction/verify/${reference}`, {
        headers: this.headers,
      }),
    )

    const tx = data.data
    const success = tx.status === 'success'

    this.logger.log({ reference, status: tx.status, amount: tx.amount / 100 }, 'paystack_payment_verified')

    return {
      success,
      reference,
      amount:   tx.amount,
      status:   tx.status,
      paidAt:   success ? new Date(tx.paid_at) : undefined,
      channel:  tx.channel,
      currency: tx.currency,
      metadata: tx.metadata,
    }
  }

  // ── Institution subscription ──────────────────────────────────────────────

  async initiateSubscription(institutionId: string, plan: keyof typeof PLANS, adminEmail: string) {
    const planConfig = PLANS[plan]
    if (!planConfig) throw new BadRequestException(`Unknown plan: ${plan}`)

    const reference = `sub_${institutionId.slice(-8)}_${plan}_${Date.now()}`

    return this.initializePayment({
      email: adminEmail,
      amount: planConfig.amount,
      reference,
      metadata: {
        type:          'SUBSCRIPTION',
        plan,
        institutionId,
        planName:      planConfig.name,
        maxWorkers:    planConfig.maxWorkers,
      },
      callbackUrl: `${this.config.get('APP_URL') ?? 'https://api.trustgrid.ng'}/api/v1/billing/callback`,
    })
  }

  // ── Worker verification payment ───────────────────────────────────────────

  async initiateVerificationPayment(
    workerId: string,
    institutionId: string,
    tier: keyof typeof VERIFICATION_FEES,
    payerEmail: string,
  ) {
    const fee = VERIFICATION_FEES[tier]
    if (!fee) throw new BadRequestException(`Unknown verification tier: ${tier}`)

    const reference = `verify_${workerId.slice(-8)}_${tier}_${Date.now()}`

    return this.initializePayment({
      email: payerEmail,
      amount: fee.amount,
      reference,
      metadata: {
        type:          'VERIFICATION_FEE',
        tier,
        workerId,
        institutionId,
        feeName:       fee.name,
      },
    })
  }

  // ── Convention module payment ─────────────────────────────────────────────

  async initiateEventPayment(
    institutionId: string,
    size: keyof typeof EVENT_FEES,
    eventName: string,
    payerEmail: string,
  ) {
    const fee = EVENT_FEES[size]
    if (!fee) throw new BadRequestException(`Unknown event size: ${size}`)

    const reference = `event_${institutionId.slice(-8)}_${size}_${Date.now()}`

    return this.initializePayment({
      email: payerEmail,
      amount: fee.amount,
      reference,
      metadata: {
        type:          'EVENT_MODULE',
        size,
        institutionId,
        eventName,
        feeName:       fee.name,
      },
    })
  }

  // ── Webhook handler ───────────────────────────────────────────────────────
  // Called by Paystack after every successful payment

  async handleWebhook(event: Record<string, unknown>, signature: string): Promise<void> {
    // Verify webhook signature
    const secret = this.config.get<string>('PAYSTACK_SECRET_KEY')
    if (!secret) return

    const crypto = await import('crypto')
    const hash = crypto.createHmac('sha512', secret)
      .update(JSON.stringify(event))
      .digest('hex')

    if (hash !== signature) {
      this.logger.warn('Invalid Paystack webhook signature')
      return
    }

    const eventType = event.event as string
    const data = event.data as Record<string, unknown>

    this.logger.log({ eventType }, 'paystack_webhook_received')

    if (eventType === 'charge.success') {
      await this.handleSuccessfulCharge(data)
    }
  }

  private async handleSuccessfulCharge(data: Record<string, unknown>) {
    const metadata = data.metadata as Record<string, unknown>
    const reference = data.reference as string
    const amount    = data.amount as number

    this.logger.log({ reference, type: metadata?.type, amount: amount / 100 }, 'payment_success')

    if (metadata?.type === 'SUBSCRIPTION' && metadata.institutionId) {
      // Update institution subscription status
      await this.prisma.institution.update({
        where: { id: metadata.institutionId as string },
        data: {
          // In production: update subscription tier, expiry, and worker limit
          // For now: log and mark as active
          isActive: true,
        },
      }).catch(() => {})
    }

    if (metadata?.type === 'VERIFICATION_FEE' && metadata.workerId) {
      // Worker verification paid — unlock verification flow
      this.logger.log({ workerId: metadata.workerId, tier: metadata.tier }, 'verification_fee_paid')
    }
  }

  // ── Pricing display helper ────────────────────────────────────────────────

  getPricingPlans() {
    return {
      subscriptions: Object.entries(PLANS).map(([key, plan]) => ({
        id:          key,
        name:        plan.name,
        amountKobo:  plan.amount,
        amountNGN:   plan.amount / 100,
        interval:    plan.interval,
        maxWorkers:  plan.maxWorkers,
        isCustom:    plan.amount === 0,
      })),
      verification: Object.entries(VERIFICATION_FEES).map(([key, fee]) => ({
        id:         key,
        name:       fee.name,
        amountKobo: fee.amount,
        amountNGN:  fee.amount / 100,
      })),
      events: Object.entries(EVENT_FEES).map(([key, fee]) => ({
        id:         key,
        name:       fee.name,
        amountKobo: fee.amount,
        amountNGN:  fee.amount / 100,
      })),
    }
  }
}
