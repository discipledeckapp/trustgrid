import { Injectable } from '@nestjs/common'
import {
  IdentityProviderAdapter,
  VerificationLevel,
  VerificationRequest,
  VerificationResult,
  BiographicData,
  DocumentType,
} from './identity-provider.adapter'

@Injectable()
export class MockIdentityAdapter implements IdentityProviderAdapter {
  readonly providerCode = 'MOCK'
  readonly countryCode = 'XX'
  readonly providerName = 'Mock Verification (Development Only)'
  readonly supportedIdTypes = ['NIN', 'BVN', 'MOCK_ID']

  validateIdFormat(idNumber: string): boolean {
    return idNumber.length >= 5
  }

  async verify(request: VerificationRequest): Promise<VerificationResult> {
    // Simulate a 300ms API round-trip
    await new Promise((r) => setTimeout(r, 300))

    // Simulate failure for IDs starting with '000'
    if (request.idNumber.startsWith('000')) {
      return {
        success: false,
        verificationLevel: VerificationLevel.NONE,
        failureCode: 'NIN_NOT_FOUND',
        failureMessage: 'NIN not found in NIMC database',
      }
    }

    return {
      success: true,
      verificationLevel: request.selfieImageBase64
        ? VerificationLevel.BIOMETRIC_CONFIRMED
        : VerificationLevel.IDENTITY_CONFIRMED,
      verifiedAt: new Date(),
      rawProviderResponse: {
        firstname: request.firstName,
        lastname: request.lastName,
        gender: 'MALE',
        birthdate: '1990-01-01',
        photo: null,
      },
    }
  }

  extractBiographicData(result: VerificationResult): BiographicData | null {
    if (!result.success || !result.rawProviderResponse) return null
    const raw = result.rawProviderResponse
    return {
      firstName: raw.firstname as string,
      lastName: raw.lastname as string,
      gender: raw.gender as string,
      dateOfBirth: raw.birthdate ? new Date(raw.birthdate as string) : undefined,
    }
  }

  getSupportedDocumentTypes(): DocumentType[] {
    return [
      { code: 'NIN',    name: 'National Identification Number', example: '12345678901' },
      { code: 'BVN',    name: 'Bank Verification Number',       example: '12345678901' },
      { code: 'MOCK_ID', name: 'Mock ID (dev only)',            example: 'MOCK12345'   },
    ]
  }
}
