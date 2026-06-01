/**
 * Nigeria Identity Adapter — Prembly IdentityPass
 *
 * NIN/BVN verification using Prembly's documented endpoints:
 *  NIN basic:    POST https://api.prembly.com/identitypass/verification/vnin
 *  NIN + face:   POST https://api.prembly.com/identitypass/verification/nin_w_face
 *  BVN + face:   POST https://api.prembly.com/identitypass/verification/bvn_w_face
 *
 * Headers: x-api-key, app-id
 * Prembly face_data.confidence is 0.0–1.0 scale — normalised to 0–100 on storage.
 */

import { Injectable, Logger } from '@nestjs/common'
import { HttpService } from '@nestjs/axios'
import { ConfigService } from '@nestjs/config'
import { firstValueFrom } from 'rxjs'
import {
  IdentityProviderAdapter,
  VerificationLevel,
  VerificationRequest,
  VerificationResult,
  BiographicData,
  DocumentType,
} from './identity-provider.adapter'

const PREMBLY_BASE = 'https://api.prembly.com/identitypass/verification'
const FACE_MATCH_MIN = 0.70   // Prembly confidence threshold (0–1 scale)

@Injectable()
export class NigeriaIdentityAdapter implements IdentityProviderAdapter {
  readonly providerCode     = 'PREMBLY_NIN_NG'
  readonly countryCode      = 'NG'
  readonly providerName     = 'Prembly IdentityPass — Nigeria (NIN/BVN)'
  readonly supportedIdTypes = ['NIN', 'VNIN', 'BVN']

  private readonly logger = new Logger(NigeriaIdentityAdapter.name)

  constructor(
    private readonly http: HttpService,
    private readonly config: ConfigService,
  ) {}

  validateIdFormat(idNumber: string, idType: string): boolean {
    if (idType === 'NIN')  return /^\d{11}$/.test(idNumber)
    if (idType === 'VNIN') return /^[A-Z0-9]{16}$/.test(idNumber)
    if (idType === 'BVN')  return /^\d{11}$/.test(idNumber)
    return false
  }

  getSupportedDocumentTypes(): DocumentType[] {
    return [
      { code: 'NIN',  name: 'National Identification Number', example: '12345678901', validationPattern: /^\d{11}$/ },
      { code: 'VNIN', name: 'Virtual NIN (16-character)',      example: 'AA123456789012BC' },
      { code: 'BVN',  name: 'Bank Verification Number',        example: '12345678901', validationPattern: /^\d{11}$/ },
    ]
  }

  async verify(request: VerificationRequest): Promise<VerificationResult> {
    const apiKey = this.config.get<string>('PREMBLY_API_KEY')
    const appId  = this.config.get<string>('PREMBLY_APP_ID')

    if (!apiKey) {
      this.logger.warn('Prembly credentials not configured — skipping, will be UNVERIFIED')
      return {
        success: false,
        verificationLevel: VerificationLevel.NONE,
        failureCode: 'PROVIDER_NOT_CONFIGURED',
        failureMessage: 'Identity verification service not configured. Worker flagged as unverified.',
      }
    }

    // app-id is optional — only include when explicitly configured
    const headers: Record<string, string> = {
      'x-api-key':    apiKey,
      'Content-Type': 'application/json',
    }
    if (appId) headers['app-id'] = appId

    try {
      if (request.idType === 'BVN' && request.selfieImageBase64) {
        return this.bvnWithFace(request, headers)
      }
      if (request.selfieImageBase64) {
        return this.ninWithFace(request, headers)
      }
      return this.ninBasic(request, headers)
    } catch (err: any) {
      const code = err?.response?.data?.response_code ?? err?.code ?? 'PROVIDER_ERROR'
      const msg  = err?.response?.data?.detail ?? err?.message ?? 'Verification service error'
      this.logger.warn({ idType: request.idType, code }, 'prembly_error')
      return {
        success: false,
        verificationLevel: VerificationLevel.NONE,
        failureCode: code,
        failureMessage: msg,
      }
    }
  }

  private async ninBasic(request: VerificationRequest, headers: Record<string, string>): Promise<VerificationResult> {
    const body = request.idType === 'VNIN'
      ? { number: request.idNumber }
      : { number_nin: request.idNumber }

    // validateStatus: () => true — never throw on HTTP error codes
    // so we always inspect the body regardless of status code
    const { data, status: httpStatus } = await firstValueFrom(
      this.http.post(`${PREMBLY_BASE}/vnin`, body, {
        headers,
        validateStatus: () => true,
      }),
    )

    this.logger.log({
      httpStatus,
      premblyStatus: data?.status,
      hasData: !!data?.data,
      hasNinData: !!data?.nin_data,
      responseCode: data?.response_code,
    }, 'prembly_nin_raw_response')

    // Prembly may return data under `data` or `nin_data` depending on endpoint version
    const ninData = data?.data ?? data?.nin_data
    const success = data?.status === true && !!ninData

    if (!success) {
      return {
        success: false,
        verificationLevel: VerificationLevel.NONE,
        failureCode: data?.response_code ?? 'NIN_NOT_FOUND',
        failureMessage: data?.detail ?? data?.message ?? 'NIN not found',
      }
    }

    return {
      success: true,
      verificationLevel: VerificationLevel.IDENTITY_CONFIRMED,
      verifiedAt: new Date(),
      rawProviderResponse: data,
    }
  }

  private async ninWithFace(request: VerificationRequest, headers: Record<string, string>): Promise<VerificationResult> {
    const { data } = await firstValueFrom(
      this.http.post(`${PREMBLY_BASE}/nin_w_face`, {
        number: request.idNumber,
        image:  request.selfieImageBase64,
      }, { headers, validateStatus: () => true }),
    )

    const ninData = data?.data ?? data?.nin_data
    if (!data?.status || !ninData) {
      return {
        success: false,
        verificationLevel: VerificationLevel.NONE,
        failureCode: data?.response_code ?? 'NIN_NOT_FOUND',
        failureMessage: data?.detail ?? data?.message ?? 'NIN not found',
      }
    }

    const faceConf: number  = data.face_data?.confidence ?? 0
    const faceMatch: boolean = data.face_data?.status === true && faceConf >= FACE_MATCH_MIN

    this.logger.log({
      ninMatch: true,
      faceMatch,
      confidence: (faceConf * 100).toFixed(1) + '%',
    }, 'prembly_nin_face_result')

    return {
      success: true,
      verificationLevel: faceMatch ? VerificationLevel.BIOMETRIC_CONFIRMED : VerificationLevel.IDENTITY_CONFIRMED,
      verifiedAt: new Date(),
      rawProviderResponse: data,
      faceMatchScore:  faceConf * 100,
      faceMatchPassed: faceMatch,
    }
  }

  private async bvnWithFace(request: VerificationRequest, headers: Record<string, string>): Promise<VerificationResult> {
    const { data } = await firstValueFrom(
      this.http.post(`${PREMBLY_BASE}/bvn_w_face`, {
        number: request.idNumber,
        image:  request.selfieImageBase64,
      }, { headers, validateStatus: () => true }),
    )

    if (!data?.status) {
      return {
        success: false,
        verificationLevel: VerificationLevel.NONE,
        failureCode: data.response_code ?? 'BVN_NOT_FOUND',
        failureMessage: data.detail ?? 'BVN not found',
      }
    }

    const faceConf: number  = data.face_data?.confidence ?? 0
    const faceMatch: boolean = data.face_data?.status === true && faceConf >= FACE_MATCH_MIN

    return {
      success: true,
      verificationLevel: faceMatch ? VerificationLevel.BIOMETRIC_CONFIRMED : VerificationLevel.IDENTITY_CONFIRMED,
      verifiedAt: new Date(),
      rawProviderResponse: data,
      faceMatchScore:  faceConf * 100,
      faceMatchPassed: faceMatch,
    }
  }

  extractBiographicData(result: VerificationResult): BiographicData | null {
    if (!result.success || !result.rawProviderResponse) return null
    const raw = result.rawProviderResponse as Record<string, any>

    // Prembly returns data under `data` (new API) or `nin_data` (old API)
    const d = raw.data ?? raw.nin_data ?? {}

    // Parse DOB — Prembly returns various formats: "01-01-1990", "1990-01-01", "01-01-0001"
    let dateOfBirth: Date | undefined
    if (d.birthdate && d.birthdate !== '01-01-0001' && d.birthdate !== '0001-01-01') {
      // Handle both "DD-MM-YYYY" and "YYYY-MM-DD"
      const parts = d.birthdate.split('-')
      if (parts.length === 3) {
        const isYearFirst = parts[0].length === 4
        const [year, month, day] = isYearFirst
          ? [parts[0], parts[1], parts[2]]
          : [parts[2], parts[1], parts[0]]
        const parsed = new Date(`${year}-${month}-${day}`)
        if (!isNaN(parsed.getTime())) dateOfBirth = parsed
      }
    }

    return {
      firstName:   (d.firstname  ?? d.first_name ?? '').trim(),
      lastName:    (d.surname    ?? d.last_name  ?? '').trim(),
      middleName:  (d.middlename ?? '').trim() || undefined,
      gender:      d.gender,
      dateOfBirth,
      nationality: 'NG',

      // NIMC photo — base64 JPEG
      // Used ONLY for face comparison. The IdentityService decides whether to store it.
      // Privacy note: we do NOT store this on the profile — only the live selfie is stored.
      photoUrl: d.photo ?? undefined,
    }
  }
}
