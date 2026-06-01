# TrustGrid — Identity Adapter Architecture

**Version:** 1.0  

---

## Design Principle

TrustGrid's identity verification must never depend directly on any single national identity system.

The core platform knows nothing about NIN, BVN, Ghana Card, or Huduma. It only knows about the `IdentityProviderAdapter` interface. This means:

- Adding a new country requires implementing one adapter class
- Changing a verification provider requires updating one adapter
- Testing requires only a mock adapter
- The trust score engine does not care how identity was verified — only the verification level and outcome

---

## The Adapter Interface

```typescript
// src/common/adapters/identity-provider.adapter.ts

export enum VerificationLevel {
  NONE = 0,
  DOCUMENT_SUBMITTED = 1,
  DOCUMENT_VERIFIED = 2,
  IDENTITY_CONFIRMED = 3,        // ID number matched to government DB
  BIOMETRIC_CONFIRMED = 4,       // Identity confirmed + face match
  FULL_BACKGROUND_CHECK = 5,     // Above + criminal background
}

export interface VerificationRequest {
  idNumber: string;
  idType: string;                // "NIN" | "BVN" | "GHANA_CARD" | "HUDUMA"
  firstName: string;
  lastName: string;
  dateOfBirth?: Date;
  selfieImageBase64?: string;    // For face match
  additionalParams?: Record<string, unknown>;
}

export interface VerificationResult {
  success: boolean;
  verificationLevel: VerificationLevel;
  verifiedAt?: Date;
  failureCode?: string;
  failureMessage?: string;
  rawProviderResponse?: unknown;
}

export interface BiographicData {
  firstName: string;
  lastName: string;
  middleName?: string;
  dateOfBirth?: Date;
  gender?: string;
  nationality?: string;
  photoUrl?: string;
  address?: string;
}

export interface DocumentType {
  code: string;
  name: string;
  example: string;
  validationPattern?: RegExp;
}

export interface IdentityProviderAdapter {
  readonly providerCode: string;       // e.g., "NIN_NG", "GHANA_CARD_GH"
  readonly countryCode: string;        // ISO 3166-1 alpha-2
  readonly providerName: string;       // Human-readable name
  readonly supportedIdTypes: string[]; // Types this provider can verify

  verify(request: VerificationRequest): Promise<VerificationResult>;
  extractBiographicData(result: VerificationResult): BiographicData | null;
  getSupportedDocumentTypes(): DocumentType[];
  validateIdFormat(idNumber: string, idType: string): boolean;
}
```

---

## Nigeria Adapter (NIN + BVN)

```typescript
// src/common/adapters/nigeria-identity.adapter.ts

@Injectable()
export class NigeriaIdentityAdapter implements IdentityProviderAdapter {
  readonly providerCode = 'NIN_NG';
  readonly countryCode = 'NG';
  readonly providerName = 'Nigeria NIMC NIN';
  readonly supportedIdTypes = ['NIN', 'BVN'];

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  validateIdFormat(idNumber: string, idType: string): boolean {
    if (idType === 'NIN') {
      return /^\d{11}$/.test(idNumber);
    }
    if (idType === 'BVN') {
      return /^\d{11}$/.test(idNumber);
    }
    return false;
  }

  async verify(request: VerificationRequest): Promise<VerificationResult> {
    const apiKey = this.configService.get('NIMC_API_KEY');
    const baseUrl = this.configService.get('NIMC_API_URL');

    try {
      const response = await this.httpService.post(
        `${baseUrl}/verify`,
        {
          nin: request.idNumber,
          firstname: request.firstName,
          lastname: request.lastName,
        },
        { headers: { Authorization: `Bearer ${apiKey}` } }
      ).toPromise();

      const matched = response.data.matched;
      const hasFaceMatch = request.selfieImageBase64
        ? await this.performFaceMatch(request.selfieImageBase64, response.data.photo)
        : null;

      return {
        success: matched,
        verificationLevel: hasFaceMatch
          ? VerificationLevel.BIOMETRIC_CONFIRMED
          : VerificationLevel.IDENTITY_CONFIRMED,
        verifiedAt: new Date(),
        rawProviderResponse: response.data,
      };
    } catch (error) {
      return {
        success: false,
        verificationLevel: VerificationLevel.NONE,
        failureCode: error.response?.data?.code ?? 'PROVIDER_ERROR',
        failureMessage: error.response?.data?.message ?? 'Verification failed',
      };
    }
  }

  extractBiographicData(result: VerificationResult): BiographicData | null {
    if (!result.success || !result.rawProviderResponse) return null;
    const raw = result.rawProviderResponse as Record<string, unknown>;
    return {
      firstName: raw.firstname as string,
      lastName: raw.lastname as string,
      dateOfBirth: raw.birthdate ? new Date(raw.birthdate as string) : undefined,
      gender: raw.gender as string,
      photoUrl: raw.photo as string,
    };
  }

  getSupportedDocumentTypes(): DocumentType[] {
    return [
      {
        code: 'NIN',
        name: 'National Identification Number',
        example: '12345678901',
        validationPattern: /^\d{11}$/,
      },
      {
        code: 'BVN',
        name: 'Bank Verification Number',
        example: '12345678901',
        validationPattern: /^\d{11}$/,
      },
    ];
  }

  private async performFaceMatch(
    selfieBase64: string,
    govPhotoUrl: string,
  ): Promise<boolean> {
    // Integrate with face matching service (AWS Rekognition, Azure Face, etc.)
    // Returns true if match confidence > 85%
    return false; // placeholder
  }
}
```

---

## Ghana Adapter

```typescript
@Injectable()
export class GhanaIdentityAdapter implements IdentityProviderAdapter {
  readonly providerCode = 'GHANA_CARD_GH';
  readonly countryCode = 'GH';
  readonly providerName = 'Ghana Card (NIA)';
  readonly supportedIdTypes = ['GHANA_CARD', 'VOTERS_ID', 'PASSPORT'];

  validateIdFormat(idNumber: string, idType: string): boolean {
    if (idType === 'GHANA_CARD') {
      return /^GHA-\d{9}-\d$/.test(idNumber);
    }
    return true;
  }

  async verify(request: VerificationRequest): Promise<VerificationResult> {
    // Integrate with NIA Ghana API
    // https://nia.gov.gh/developer
    throw new Error('Ghana adapter: configure NIA_GHANA_API_KEY');
  }

  extractBiographicData(result: VerificationResult): BiographicData | null {
    // Extract from NIA response format
    return null;
  }

  getSupportedDocumentTypes(): DocumentType[] {
    return [
      { code: 'GHANA_CARD', name: 'Ghana Card', example: 'GHA-123456789-0' },
      { code: 'VOTERS_ID', name: "Voter's ID", example: '1234567890' },
    ];
  }
}
```

---

## Mock Adapter (Testing & MVP)

```typescript
@Injectable()
export class MockIdentityAdapter implements IdentityProviderAdapter {
  readonly providerCode = 'MOCK';
  readonly countryCode = 'XX';
  readonly providerName = 'Mock Verification (Development)';
  readonly supportedIdTypes = ['MOCK_ID'];

  validateIdFormat(idNumber: string): boolean {
    return idNumber.length >= 5;
  }

  async verify(request: VerificationRequest): Promise<VerificationResult> {
    // Simulate 200ms API delay
    await new Promise(resolve => setTimeout(resolve, 200));

    // Return VERIFIED for any well-formatted ID in dev/test
    return {
      success: true,
      verificationLevel: VerificationLevel.IDENTITY_CONFIRMED,
      verifiedAt: new Date(),
    };
  }

  extractBiographicData(result: VerificationResult): BiographicData {
    return {
      firstName: 'Verified',
      lastName: 'User',
    };
  }

  getSupportedDocumentTypes(): DocumentType[] {
    return [{ code: 'MOCK_ID', name: 'Mock ID', example: 'MOCK12345' }];
  }
}
```

---

## Adapter Registry

```typescript
// src/common/adapters/identity-adapter.registry.ts

@Injectable()
export class IdentityAdapterRegistry {
  private adapters = new Map<string, IdentityProviderAdapter>();

  constructor(
    private readonly nigeriaAdapter: NigeriaIdentityAdapter,
    private readonly ghanaAdapter: GhanaIdentityAdapter,
    private readonly mockAdapter: MockIdentityAdapter,
  ) {
    this.register(nigeriaAdapter);
    this.register(ghanaAdapter);
    this.register(mockAdapter);
  }

  private register(adapter: IdentityProviderAdapter): void {
    this.adapters.set(adapter.providerCode, adapter);
    for (const idType of adapter.supportedIdTypes) {
      this.adapters.set(`${idType}_${adapter.countryCode}`, adapter);
    }
  }

  getAdapter(countryCode: string, idType: string): IdentityProviderAdapter {
    const key = `${idType}_${countryCode}`;
    const adapter = this.adapters.get(key);

    if (!adapter) {
      throw new Error(
        `No identity adapter for country=${countryCode}, idType=${idType}. ` +
        `Available: ${[...this.adapters.keys()].join(', ')}`
      );
    }

    return adapter;
  }

  getAdaptersForCountry(countryCode: string): IdentityProviderAdapter[] {
    return [...this.adapters.values()].filter(a => a.countryCode === countryCode);
  }

  getSupportedCountries(): string[] {
    return [...new Set([...this.adapters.values()].map(a => a.countryCode))];
  }
}
```

---

## Identity Verification Service

```typescript
// src/modules/identity/identity-verification.service.ts

@Injectable()
export class IdentityVerificationService {
  constructor(
    private readonly adapterRegistry: IdentityAdapterRegistry,
    private readonly prisma: PrismaService,
    private readonly encryptionService: EncryptionService,
    private readonly trustScoreService: TrustScoreService,
  ) {}

  async initiateVerification(
    workerId: string,
    institutionId: string,
    request: InitiateVerificationDto,
  ): Promise<IdentityVerification> {
    // 1. Get institution country
    const institution = await this.prisma.institution.findUnique({
      where: { id: institutionId },
      select: { country: true, config: true },
    });

    // 2. Get correct adapter
    const adapter = this.adapterRegistry.getAdapter(
      institution.country,
      request.idType,
    );

    // 3. Validate ID format
    if (!adapter.validateIdFormat(request.idNumber, request.idType)) {
      throw new BadRequestException(`Invalid ${request.idType} format`);
    }

    // 4. Check for duplicate verification
    const idHash = createHash('sha256').update(request.idNumber).digest('hex');
    const existing = await this.prisma.identityVerification.findFirst({
      where: { idNumberHash: idHash, status: 'FULLY_VERIFIED' },
    });
    if (existing && existing.workerId !== workerId) {
      throw new ConflictException('This identity document is already registered to another worker');
    }

    // 5. Create pending verification record
    const verification = await this.prisma.identityVerification.create({
      data: {
        workerId,
        providerName: adapter.providerCode,
        countryCode: institution.country,
        idNumber: this.encryptionService.encrypt(request.idNumber),
        idNumberHash: idHash,
        status: 'PENDING',
      },
    });

    // 6. Call adapter asynchronously (queue in production)
    this.performVerification(verification.id, adapter, request).catch(err =>
      console.error('Verification failed:', err),
    );

    return verification;
  }

  private async performVerification(
    verificationId: string,
    adapter: IdentityProviderAdapter,
    request: InitiateVerificationDto,
  ): Promise<void> {
    const result = await adapter.verify({
      idNumber: request.idNumber,
      idType: request.idType,
      firstName: request.firstName,
      lastName: request.lastName,
      selfieImageBase64: request.selfieImageBase64,
    });

    const status = result.success
      ? result.verificationLevel >= VerificationLevel.IDENTITY_CONFIRMED
        ? 'FULLY_VERIFIED'
        : 'PARTIALLY_VERIFIED'
      : 'VERIFICATION_FAILED';

    const bioData = result.success
      ? adapter.extractBiographicData(result)
      : null;

    await this.prisma.identityVerification.update({
      where: { id: verificationId },
      data: {
        status,
        verifiedAt: result.success ? new Date() : null,
        failureReason: result.failureMessage,
        biographicData: bioData
          ? this.encryptionService.encrypt(JSON.stringify(bioData))
          : null,
        faceMatchScore: result.rawProviderResponse?.faceMatchScore ?? null,
        faceMatchPassed: result.rawProviderResponse?.faceMatchPassed ?? null,
      },
    });

    if (result.success) {
      // Update worker verification status and emit trust event
      await this.prisma.workerProfile.update({
        where: { id: await this.getWorkerIdFromVerification(verificationId) },
        data: { verificationStatus: status as VerificationStatus },
      });

      await this.trustScoreService.emitEvent({
        type: 'IDENTITY_VERIFIED',
        workerId: await this.getWorkerIdFromVerification(verificationId),
        referenceType: 'identity_verification',
        referenceId: verificationId,
      });
    }
  }
}
```

---

## Country Adapter Roadmap

| Country | Provider | Status | Priority |
|---------|----------|--------|----------|
| Nigeria | NIMC (NIN) | MVP (mock) → Month 1 (live) | P0 |
| Nigeria | CBN (BVN) | Month 2 | P0 |
| Ghana | NIA (Ghana Card) | Month 4 | P1 |
| Kenya | IPRS (Huduma) | Month 6 | P1 |
| Rwanda | NIDA | Month 8 | P2 |
| South Africa | DHA | Month 10 | P2 |
| Côte d'Ivoire | ONI | Year 2 | P3 |

**Manual fallback (all countries):**
When no digital adapter is available, TrustGrid supports manual document review — a platform admin reviews uploaded documents and manually sets verification status. This unlocks any country on day one, with digital automation added over time.
