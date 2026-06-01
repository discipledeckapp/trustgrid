/**
 * Identity Adapter Registry
 *
 * Selects the right identity verification adapter by country code.
 * For countries without automated support, falls back to ManualVerificationAdapter
 * so onboarding is NEVER blocked — the worker is simply flagged as UNVERIFIED.
 *
 * Country coverage:
 *  NG → Prembly (NIN, VNIN, BVN + face match)
 *  GH → Prembly covers Ghana Card — uses Prembly with GH config (future adapter)
 *  KE → Prembly covers Huduma Number — future adapter
 *  ZA → Prembly covers SA ID — future adapter
 *  RW → Manual (NIDA not integrated yet)
 *  ALL OTHERS → Manual (document upload, human review)
 *
 * When IDENTITY_ADAPTER=MOCK is set (dev/test) → MockIdentityAdapter always wins.
 */

import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { IdentityProviderAdapter } from './identity-provider.adapter'
import { NigeriaIdentityAdapter } from './nigeria-identity.adapter'
import { ManualVerificationAdapter } from './manual-verification.adapter'
import { MockIdentityAdapter } from './mock-identity.adapter'

@Injectable()
export class IdentityAdapterRegistry {
  constructor(
    private readonly config: ConfigService,
    private readonly nigeriaAdapter: NigeriaIdentityAdapter,
    private readonly manualAdapter: ManualVerificationAdapter,
    private readonly mockAdapter: MockIdentityAdapter,
  ) {}

  /**
   * Get the adapter for a given country.
   * Always returns something — never null.
   * Falls back to ManualVerificationAdapter for unsupported countries.
   */
  getAdapter(countryCode: string): IdentityProviderAdapter {
    // Development/test mode: always use mock
    if (this.config.get('IDENTITY_ADAPTER') === 'MOCK') {
      return this.mockAdapter
    }

    switch (countryCode.toUpperCase()) {
      case 'NG':
        return this.nigeriaAdapter

      // Prembly has Ghana and Kenya coverage — wire dedicated adapters
      // when those are built. Until then, fall through to manual.
      case 'GH':
      case 'KE':
      case 'ZA':
      case 'RW':
      default:
        return this.manualAdapter
    }
  }

  /**
   * Returns available ID types for a country (shown to user in onboarding wizard).
   */
  getSupportedIdTypes(countryCode: string): string[] {
    const adapter = this.getAdapter(countryCode)
    return adapter.supportedIdTypes
  }

  /**
   * Returns human-readable document type definitions for the onboarding UI.
   */
  getSupportedDocumentTypes(countryCode: string) {
    return this.getAdapter(countryCode).getSupportedDocumentTypes()
  }

  isAutomatedCountry(countryCode: string): boolean {
    if (this.config.get('IDENTITY_ADAPTER') === 'MOCK') return true
    return ['NG'].includes(countryCode.toUpperCase())
  }
}
