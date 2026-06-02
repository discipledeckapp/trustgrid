export interface BrandConfig {
  displayName?: string
  tagline?: string
  primaryColor?: string
  accentColor?: string
  logoUrl?: string
  faviconUrl?: string
  backgroundImageUrl?: string      // auth page background image
  backgroundOverlayOpacity?: number // 0–1, default 0.65
  poweredByVisible?: boolean
  appName?: string
}

export interface CommunityBrand {
  found: boolean
  institutionId?: string
  slug?: string
  subdomain?: string
  customDomain?: string
  brandConfig?: BrandConfig
  name?: string
}

export const DEFAULT_BRAND: BrandConfig = {
  displayName: 'TrustGrid',
  tagline: 'Trusted People. Trusted Communities. Trusted Opportunities.',
  primaryColor: '#4F46E5',
  accentColor: '#0D9488',
  poweredByVisible: true,
  appName: 'TrustGrid',
}

export function getCssVars(brand: BrandConfig): Record<string, string> {
  return {
    '--brand-primary': brand.primaryColor ?? DEFAULT_BRAND.primaryColor!,
    '--brand-accent':  brand.accentColor  ?? DEFAULT_BRAND.accentColor!,
  }
}
