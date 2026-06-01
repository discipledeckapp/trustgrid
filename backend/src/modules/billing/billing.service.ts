/**
 * BillingService — Paystack Integration
 *
 * All revenue streams from docs/06-business-design.md:
 *
 * 1. Workforce Governance Subscription (monthly recurring)
 *    Starter ₦15K (50 workers) | Growth ₦45K (200 workers) |
 *    Professional ₦120K (1,000 workers) | Enterprise (custom)
 *    Annual: 15% discount
 *
 * 2. Convention & Event Module (per-event flat fee)
 *    Small ₦150K | Medium ₦400K | Large ₦1.2M | Enterprise (custom)
 *
 * 3. Verification Services (one-time per worker)
 *    Individual: Basic ₦5K | Standard ₦12K | Professional ₦25K
 *    Institutional bulk: Basic ₦3.5K | Standard ₦8K | Professional ₦18K
 *
 * 4. Worker Premium Profile (monthly, worker pays)
 *    ₦2,000/month — higher visibility, priority matching
 *
 * 5. Procurement Governance Module (monthly add-on)
 *    Basic ₦25K (20 vendors) | Standard ₦65K (100 vendors)
 *
 * 6. Compliance Reporting (per report package)
 *    ₦50K–₦200K per institutional report
 *
 * 7. API Access (usage-based or flat)
 *    ₦100/call (after 10K free) or ₦50K/month flat
 *
 * All amounts in Paystack are in kobo (₦1 = 100 kobo).
 */

import { Injectable, Logger, BadRequestException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { HttpService } from '@nestjs/axios'
import { firstValueFrom } from 'rxjs'
import { PrismaService } from '../../prisma/prisma.service'

const PAYSTACK_BASE = 'https://api.paystack.co'
const ANNUAL_DISCOUNT = 0.15   // 15% off for annual commitment

// ─── 1. Subscription plans ─────────────────────────────────────────────────
// FIXED: Growth tier is 200 workers (was 250 — business doc says 200)
export const PLANS = {
  starter: {
    name: 'TrustGrid Starter', description: 'Small estates, small churches',
    monthlyAmount: 1_500_000, interval: 'monthly', maxWorkers: 50,
    features: ['Up to 50 workers','NIN/BVN verification','Trust score engine','Service requests','Incident management','Email support'],
  },
  growth: {
    name: 'TrustGrid Growth', description: 'Medium estates, active churches',
    monthlyAmount: 4_500_000, interval: 'monthly', maxWorkers: 200,  // ← 200 not 250
    features: ['Up to 200 workers','All Starter features','Performance reviews','Endorsements','Organisations module','WhatsApp notifications','Priority support'],
  },
  professional: {
    name: 'TrustGrid Professional', description: 'Large estates, universities',
    monthlyAmount: 12_000_000, interval: 'monthly', maxWorkers: 1000,
    features: ['Up to 1,000 workers','All Growth features','Volunteer registry','Procurement governance','Analytics & reports','Custom trust weights','Dedicated onboarding'],
  },
  enterprise: {
    name: 'TrustGrid Enterprise', description: 'Multi-site, smart city operators',
    monthlyAmount: 0, interval: 'monthly', maxWorkers: -1,
    features: ['Unlimited workers','All Professional features','Multi-site management','Smart city dashboard','Custom integrations','SLA agreement','Dedicated account manager'],
    isCustom: true,
    contactEmail: 'hello@trustgrid.ng',
  },
}

// ─── 2. Event module fees ──────────────────────────────────────────────────
export const EVENT_FEES = {
  small:      { name: 'Convention Module — Small (50–100 workers)',    amount: 15_000_000,  maxWorkers: 100 },
  medium:     { name: 'Convention Module — Medium (100–500 workers)',  amount: 40_000_000,  maxWorkers: 500 },
  large:      { name: 'Convention Module — Large (500–2,000 workers)', amount: 120_000_000, maxWorkers: 2000 },
  enterprise: { name: 'Convention Module — Enterprise (2,000+ workers)', amount: 0, maxWorkers: -1, isCustom: true },
}

// ─── 3. Verification fees ──────────────────────────────────────────────────
// Two price columns: individual (worker pays) vs bulk (institution pays for many)
export const VERIFICATION_FEES = {
  basic: {
    name: 'Basic Verification (NIN)',
    individualAmount: 500_000,       // ₦5,000  — worker pays
    bulkAmount:       350_000,       // ₦3,500  — institution bulk rate
  },
  standard: {
    name: 'Standard Verification (NIN + BVN + Face)',
    individualAmount: 1_200_000,     // ₦12,000
    bulkAmount:       800_000,       // ₦8,000
  },
  professional: {
    name: 'Professional Verification (Standard + Credential)',
    individualAmount: 2_500_000,     // ₦25,000
    bulkAmount:       1_800_000,     // ₦18,000
  },
}

// ─── 4. Worker premium profile (supply side — worker pays) ─────────────────
export const WORKER_PREMIUM = {
  monthly: { name: 'Worker Premium Profile', amount: 200_000 },  // ₦2,000/month
}

// ─── 5. Procurement Governance Module (add-on) ─────────────────────────────
export const PROCUREMENT_MODULE = {
  basic:    { name: 'Procurement Governance — Basic (up to 20 vendors)',  amount: 2_500_000 },  // ₦25,000/month
  standard: { name: 'Procurement Governance — Standard (up to 100 vendors)', amount: 6_500_000 }, // ₦65,000/month
}

// ─── 6. Compliance Reporting (per report package) ──────────────────────────
export const COMPLIANCE_REPORTS = {
  basic:    { name: 'Workforce Verification Report',      amount: 5_000_000 },   // ₦50,000
  standard: { name: 'Vendor Governance Report',           amount: 7_500_000 },   // ₦75,000
  full:     { name: 'Full Annual Compliance Package',     amount: 15_000_000 },  // ₦150,000
  premium:  { name: 'Premium Compliance Report Package',  amount: 20_000_000 },  // ₦200,000
}

// ─── 7. API Access (usage-based or flat) ───────────────────────────────────
export const API_ACCESS = {
  perCall:  { name: 'API Access — Per Call (after 10K free)', amountPerCall: 10 },  // ₦100/call = 10 kobo
  flat:     { name: 'API Access — Flat Rate Unlimited',        amount: 5_000_000 }, // ₦50,000/month
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

  async initiateSubscription(
    institutionId: string,
    plan: keyof typeof PLANS,
    adminEmail: string,
    isAnnual = false,
  ) {
    const planConfig = PLANS[plan]
    if (!planConfig) throw new BadRequestException(`Unknown plan: ${plan}`)
    if ((planConfig as any).isCustom) {
      throw new BadRequestException(`Enterprise plan requires a custom quote. Contact hello@trustgrid.ng`)
    }

    // Annual: 12 months × (1 - 15% discount)
    const monthlyAmount = planConfig.monthlyAmount
    const amount = isAnnual
      ? Math.round(monthlyAmount * 12 * (1 - ANNUAL_DISCOUNT))  // 15% discount
      : monthlyAmount

    const reference = `sub_${institutionId.slice(-8)}_${plan}_${isAnnual ? 'annual' : 'monthly'}_${Date.now()}`

    return this.initializePayment({
      email: adminEmail,
      amount,
      reference,
      metadata: {
        type:          'SUBSCRIPTION',
        plan,
        isAnnual,
        savings: isAnnual ? Math.round(monthlyAmount * 12 * ANNUAL_DISCOUNT / 100) : 0,
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
    // Use bulk rate when institution pays, individual rate when worker pays
    const amount = fee.bulkAmount  // institution bulk rate

    return this.initializePayment({
      email: payerEmail,
      amount,
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
  // Returns the complete pricing catalogue aligned with business-design.md

  getPricingPlans() {
    return {
      // 1. Subscriptions — monthly + annual (15% off)
      subscriptions: Object.entries(PLANS).map(([key, plan]) => ({
        id:              key,
        name:            plan.name,
        description:     plan.description,
        monthlyAmountNGN: plan.monthlyAmount / 100,
        annualAmountNGN: plan.monthlyAmount > 0
          ? Math.round(plan.monthlyAmount * 12 * (1 - ANNUAL_DISCOUNT)) / 100
          : 0,
        annualSavingsNGN: plan.monthlyAmount > 0
          ? Math.round(plan.monthlyAmount * 12 * ANNUAL_DISCOUNT) / 100
          : 0,
        annualDiscountPct: ANNUAL_DISCOUNT * 100,
        maxWorkers:      plan.maxWorkers,
        isCustom:        !!(plan as any).isCustom,
        contactEmail:    (plan as any).contactEmail,
        features:        plan.features,
      })),

      // 2. Events — per-event flat fee
      events: Object.entries(EVENT_FEES).map(([key, fee]) => ({
        id:          key,
        name:        fee.name,
        amountNGN:   (fee as any).isCustom ? null : fee.amount / 100,
        maxWorkers:  (fee as any).maxWorkers,
        isCustom:    !!(fee as any).isCustom,
      })),

      // 3. Verification — individual vs bulk (institution pays for many)
      verification: Object.entries(VERIFICATION_FEES).map(([key, fee]) => ({
        id:                   key,
        name:                 fee.name,
        individualAmountNGN:  fee.individualAmount / 100,  // worker pays
        bulkAmountNGN:        fee.bulkAmount / 100,         // institution bulk rate
      })),

      // 4. Worker premium profile (supply side)
      workerPremium: {
        monthlyAmountNGN: WORKER_PREMIUM.monthly.amount / 100,
        description: 'Higher visibility in search, priority matching, verified badge',
      },

      // 5. Procurement governance add-on
      procurement: Object.entries(PROCUREMENT_MODULE).map(([key, mod]) => ({
        id:          key,
        name:        mod.name,
        monthlyAmountNGN: mod.amount / 100,
      })),

      // 6. Compliance reporting (per report package)
      compliance: Object.entries(COMPLIANCE_REPORTS).map(([key, rep]) => ({
        id:       key,
        name:     rep.name,
        amountNGN: rep.amount / 100,
      })),

      // 7. API access (usage-based or flat)
      apiAccess: {
        perCallNGN:  API_ACCESS.perCall.amountPerCall / 100,
        freeCallsPerMonth: 10000,
        flatMonthlyNGN: API_ACCESS.flat.amount / 100,
        description: '₦100/call after 10,000 free calls, or ₦50,000/month flat',
      },
    }
  }

  // Kept for backwards compat — remove after dashboard update
  getPricingPlansLegacy() {
    return {
      subscriptions: Object.entries(PLANS).map(([key, plan]) => ({
        id: key, name: plan.name,
        amountKobo:  plan.monthlyAmount,
        amountNGN:   plan.monthlyAmount / 100,
        interval:    plan.interval,
        maxWorkers:  plan.maxWorkers,
        isCustom:    !!(plan as any).isCustom,
      })),
      verification: Object.entries(VERIFICATION_FEES).map(([key, fee]) => ({
        id: key, name: fee.name,
        amountKobo: fee.individualAmount,
        amountNGN:  fee.individualAmount / 100,
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
