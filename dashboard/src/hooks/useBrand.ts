'use client'
import { useEffect, useState } from 'react'
import { BrandConfig, CommunityBrand, DEFAULT_BRAND } from '@/lib/brand'

export function useBrand(): CommunityBrand & { effective: BrandConfig } {
  const [brand, setBrand] = useState<CommunityBrand>({ found: false })

  useEffect(() => {
    // Read community host from cookie set by middleware
    const slug = document.cookie
      .split('; ')
      .find(r => r.startsWith('community-slug='))
      ?.split('=')[1]

    const host = document.cookie
      .split('; ')
      .find(r => r.startsWith('community-host='))
      ?.split('=')[1]

    const resolvedHost = host ?? (slug ? `${slug}.trustgrid.ng` : null)
    if (!resolvedHost) return

    const apiBase = process.env.NEXT_PUBLIC_API_URL ?? 'https://trustgrid-backend.onrender.com/api/v1'
    fetch(`${apiBase}/institutions/brand?host=${encodeURIComponent(resolvedHost)}`)
      .then(r => r.json())
      .then((data: CommunityBrand) => {
        if (data.found) setBrand(data)
      })
      .catch(() => {})
  }, [])

  const effective: BrandConfig = brand.found && brand.brandConfig
    ? { ...DEFAULT_BRAND, ...brand.brandConfig }
    : DEFAULT_BRAND

  return { ...brand, effective }
}
