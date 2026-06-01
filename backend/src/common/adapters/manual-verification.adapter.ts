/**
 * Manual Verification Adapter — Fallback for unsupported countries
 *
 * Used when:
 *  - Country is not supported by Prembly or any other automated provider
 *  - IDENTITY_ADAPTER=MANUAL is set in env
 *
 * Behaviour:
 *  - Always returns success=false with MANUAL_REVIEW_REQUIRED code
 *  - IdentityService interprets this as: onboarding proceeds, worker is
 *    set to UNVERIFIED, flagged for manual review by institution admin
 *  - Institution admin reviews uploaded documents and manually approves
 *
 * This ensures onboarding is NEVER a hard block for non-Nigerian workers.
 */

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
export class ManualVerificationAdapter implements IdentityProviderAdapter {
  readonly providerCode     = 'MANUAL'
  readonly countryCode      = 'XX'   // wildcard — matches any country without a specific adapter
  readonly providerName     = 'Manual Document Review'
  readonly supportedIdTypes = ['PASSPORT', 'NATIONAL_ID', 'DRIVERS_LICENSE', 'OTHER']

  validateIdFormat(_idNumber: string, _idType: string): boolean {
    // Accept any format — human reviewer will judge
    return true
  }

  async verify(_request: VerificationRequest): Promise<VerificationResult> {
    // Return a clear "not automated" result — not a failure, just a flag
    return {
      success: false,
      verificationLevel: VerificationLevel.NONE,
      failureCode: 'MANUAL_REVIEW_REQUIRED',
      failureMessage:
        'Automated identity verification is not available for this country. ' +
        'The applicant has been marked as unverified and their documents will be ' +
        'reviewed manually by the institution administrator.',
    }
  }

  extractBiographicData(_result: VerificationResult): BiographicData | null {
    return null  // Human reviewer extracts this manually
  }

  getSupportedDocumentTypes(): DocumentType[] {
    return [
      { code: 'PASSPORT',        name: 'International Passport',  example: 'A12345678' },
      { code: 'NATIONAL_ID',     name: 'National ID Card',         example: 'Any format' },
      { code: 'DRIVERS_LICENSE', name: "Driver's Licence",         example: 'Any format' },
      { code: 'OTHER',           name: 'Other Government ID',      example: 'Any format' },
    ]
  }
}
