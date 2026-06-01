/**
 * Prembly CAC Adapter — Organisation Verification
 *
 * Verifies Nigerian companies against the Corporate Affairs Commission (CAC)
 * database using Prembly's IdentityPass endpoint.
 *
 * Endpoint: POST https://api.prembly.com/api/v2/biometrics/merchant/data/verification/cac
 * Headers:  x-api-key, app-id
 * Params:   rc_number (query), company_type (query: BN|RC|IT|LL|LLP, default RC)
 *
 * Response fields: company_name, company_status, date_of_registration, address,
 *                  state, directors[], verification.reference
 *
 * IMPORTANT: Failure is never a hard block. Organisations without CAC verification
 * are marked UNVERIFIED and can continue onboarding.
 */

import { Injectable, Logger } from '@nestjs/common'
import { HttpService } from '@nestjs/axios'
import { ConfigService } from '@nestjs/config'
import { firstValueFrom } from 'rxjs'

export interface CACVerificationRequest {
  rcNumber: string
  companyType?: 'BN' | 'RC' | 'IT' | 'LL' | 'LLP'
  companyName?: string   // optional name check
}

export interface CACVerificationResult {
  verified: boolean
  rcNumber?: string
  companyName?: string
  companyStatus?: string
  dateOfRegistration?: string
  address?: string
  state?: string
  directors?: Array<{ name: string; designation: string }>
  reference?: string
  failureCode?: string
  failureMessage?: string
}

const CAC_BASE = 'https://api.prembly.com/api/v2/biometrics/merchant/data/verification/cac'

@Injectable()
export class PremblyCACAdapter {
  private readonly logger = new Logger(PremblyCACAdapter.name)

  constructor(
    private readonly http: HttpService,
    private readonly config: ConfigService,
  ) {}

  isConfigured(): boolean {
    return !!(this.config.get('PREMBLY_API_KEY') && this.config.get('PREMBLY_APP_ID'))
  }

  async verify(request: CACVerificationRequest): Promise<CACVerificationResult> {
    const apiKey = this.config.get<string>('PREMBLY_API_KEY')
    const appId  = this.config.get<string>('PREMBLY_APP_ID')

    if (!apiKey) {
      this.logger.warn('Prembly not configured — CAC verification skipped')
      return {
        verified: false,
        failureCode: 'PROVIDER_NOT_CONFIGURED',
        failureMessage: 'CAC verification service not configured. Organisation flagged as unverified.',
      }
    }

    const headers: Record<string, string> = { 'x-api-key': apiKey }
    if (appId) headers['app-id'] = appId

    try {
      const { data } = await firstValueFrom(
        this.http.post(CAC_BASE, null, {
          params: {
            rc_number:    request.rcNumber,
            company_type: request.companyType ?? 'RC',
          },
          headers,
        }),
      )

      if (!data.status || !data.data) {
        this.logger.warn({
          rc: request.rcNumber,
          code: data.response_code,
          detail: data.detail,
        }, 'cac_not_found')

        return {
          verified: false,
          rcNumber: request.rcNumber,
          failureCode:    data.response_code ?? 'CAC_NOT_FOUND',
          failureMessage: data.detail ?? 'RC number not found in CAC database',
        }
      }

      const d = data.data as Record<string, any>

      this.logger.log({
        rc: request.rcNumber,
        companyName: d.company_name,
        status: d.company_status,
      }, 'cac_verified')

      return {
        verified:            true,
        rcNumber:            d.rc_number ?? request.rcNumber,
        companyName:         d.company_name,
        companyStatus:       d.company_status,
        dateOfRegistration:  d.date_of_registration,
        address:             d.address ?? d.branchAddress,
        state:               d.state,
        directors:           d.directors ?? [],
        reference:           data.verification?.reference,
      }
    } catch (err: any) {
      const code = err?.response?.data?.response_code ?? err?.code ?? 'PROVIDER_ERROR'
      const msg  = err?.response?.data?.detail ?? err?.message ?? 'CAC service error'

      this.logger.warn({ rc: request.rcNumber, code }, 'cac_verification_error')

      return {
        verified:       false,
        rcNumber:       request.rcNumber,
        failureCode:    code,
        failureMessage: msg,
      }
    }
  }
}
