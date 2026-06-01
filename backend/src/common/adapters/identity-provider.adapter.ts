export enum VerificationLevel {
  NONE = 0,
  DOCUMENT_SUBMITTED = 1,
  DOCUMENT_VERIFIED = 2,
  IDENTITY_CONFIRMED = 3,
  BIOMETRIC_CONFIRMED = 4,
  FULL_BACKGROUND_CHECK = 5,
}

export interface VerificationRequest {
  idNumber: string
  idType: string
  firstName: string
  lastName: string
  dateOfBirth?: Date
  selfieImageBase64?: string
}

export interface VerificationResult {
  success: boolean
  verificationLevel: VerificationLevel
  verifiedAt?: Date
  failureCode?: string
  failureMessage?: string
  rawProviderResponse?: Record<string, unknown>
  faceMatchScore?: number       // 0–100 normalised
  faceMatchPassed?: boolean
}

export interface BiographicData {
  firstName: string
  lastName: string
  middleName?: string
  dateOfBirth?: Date
  gender?: string
  nationality?: string
  photoUrl?: string
  address?: string
}

export interface DocumentType {
  code: string
  name: string
  example: string
  validationPattern?: RegExp
}

export interface IdentityProviderAdapter {
  readonly providerCode: string
  readonly countryCode: string
  readonly providerName: string
  readonly supportedIdTypes: string[]

  verify(request: VerificationRequest): Promise<VerificationResult>
  extractBiographicData(result: VerificationResult): BiographicData | null
  getSupportedDocumentTypes(): DocumentType[]
  validateIdFormat(idNumber: string, idType: string): boolean
}
