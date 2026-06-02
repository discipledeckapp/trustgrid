/**
 * CredentialExpiryService
 * Sends 30-day, 7-day, and 1-day expiry alerts for TrustCredentials.
 * Called manually via triggerCheck() or from a cron once @nestjs/schedule is added.
 * Inspired by ComplyFlow's document expiry alert capability.
 */

import { Injectable, Logger } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'
import { ZeptomailService } from '../../common/email/zeptomail.service'
import { TermiiService } from '../../common/notifications/termii.service'

@Injectable()
export class CredentialExpiryService {
  private readonly logger = new Logger(CredentialExpiryService.name)

  constructor(
    private readonly prisma: PrismaService,
    private readonly email: ZeptomailService,
    private readonly termii: TermiiService,
  ) {}

  async checkExpiringCredentials(): Promise<{ checked: number; alertsSent: number }> {
    this.logger.log('Running credential expiry check...')
    let alertsSent = 0
    let checked = 0

    for (const daysAhead of [30, 7, 1]) {
      const today = new Date()
      const windowStart = new Date(today.getFullYear(), today.getMonth(), today.getDate() + daysAhead)
      const windowEnd   = new Date(today.getFullYear(), today.getMonth(), today.getDate() + daysAhead + 1)

      const expiring = await this.prisma.trustCredential.findMany({
        where: {
          status: 'ACTIVE',
          expiresAt: { gte: windowStart, lt: windowEnd },
        },
        include: {
          passport: true,
        },
      })

      checked += expiring.length

      for (const cred of expiring) {
        // Look up user and institution separately (TrustPassport has no direct relations)
        const [userAccount, institution] = await Promise.all([
          this.prisma.userAccount.findUnique({
            where: { id: cred.passport.userId },
            select: { firstName: true, email: true, phone: true },
          }),
          this.prisma.institution.findUnique({
            where: { id: cred.passport.institutionId },
            select: { name: true },
          }),
        ])
        if (!userAccount) continue
        const user = userAccount
        const communityName = institution?.name ?? 'TrustGrid'
        const daysLabel = daysAhead === 1 ? 'tomorrow' : `in ${daysAhead} days`
        const smsText = `TrustGrid: Your "${cred.label}" credential expires ${daysLabel}. Contact ${communityName} admin to renew.`

        if (user.email) {
          await this.email.sendEmail({
            to: user.email,
            toName: user.firstName,
            subject: `Credential expiring ${daysLabel} — ${cred.label}`,
            htmlBody: `
              <div style="font-family:Inter,Arial,sans-serif;max-width:480px;margin:0 auto;">
                <div style="background:linear-gradient(135deg,#4F46E5,#0D9488);padding:24px 32px;border-radius:16px 16px 0 0;">
                  <h1 style="color:#fff;margin:0;font-size:18px;font-weight:900;">Credential Expiring ${daysAhead === 1 ? 'Tomorrow' : `in ${daysAhead} Days`}</h1>
                  <p style="color:rgba(255,255,255,0.7);margin:4px 0 0;font-size:13px;">${communityName}</p>
                </div>
                <div style="padding:24px 32px;background:#fff;">
                  <p style="color:#1e293b;font-size:15px;">Hi <strong>${user.firstName}</strong>,</p>
                  <div style="background:#fef3c7;border-left:4px solid #f59e0b;padding:16px;border-radius:0 8px 8px 0;margin:16px 0;">
                    <p style="margin:0;font-weight:700;color:#92400e;">${cred.label}</p>
                    <p style="margin:4px 0 0;font-size:13px;color:#78350f;">Expires: ${new Date(cred.expiresAt!).toLocaleDateString('en-NG', { dateStyle: 'long' })}</p>
                  </div>
                  <p style="color:#64748b;font-size:14px;">Contact your community administrator at <strong>${communityName}</strong> to renew this credential and maintain your trust score.</p>
                </div>
                <div style="padding:16px 32px;background:#f8fafc;border-radius:0 0 16px 16px;text-align:center;">
                  <p style="margin:0;font-size:11px;color:#cbd5e1;">Powered by TrustGrid · trustgrid.ng</p>
                </div>
              </div>
            `,
          }).catch(() => {})
          alertsSent++
        }

        if (user.phone) {
          await this.termii.sendSMS(user.phone, smsText).catch(() => {})
          alertsSent++
        }
      }

      if (expiring.length > 0) {
        this.logger.log({ daysAhead, count: expiring.length }, 'credential_expiry_alerts_sent')
      }
    }

    return { checked, alertsSent }
  }

  // Manual trigger — call via POST /passport/credentials/trigger-expiry-check (admin only)
  async triggerCheck() {
    const result = await this.checkExpiringCredentials()
    this.logger.log(result, 'credential_expiry_check_complete')
    return result
  }
}
