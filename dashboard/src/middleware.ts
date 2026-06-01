import { NextRequest, NextResponse } from 'next/server'

const TRUSTGRID_DOMAIN = 'trustgrid.ng'
const RESERVED = new Set(['app', 'admin', 'www', 'api', 'verify'])

export function middleware(request: NextRequest) {
  const host = request.headers.get('host') ?? ''
  const cleanHost = host.split(':')[0].toLowerCase()

  let communitySlug: string | null = null
  let communityHost: string | null = null

  if (cleanHost.endsWith(`.${TRUSTGRID_DOMAIN}`)) {
    const sub = cleanHost.replace(`.${TRUSTGRID_DOMAIN}`, '')
    if (!RESERVED.has(sub)) {
      communitySlug = sub
      communityHost = cleanHost
    }
  } else if (
    !cleanHost.includes('trustgrid.ng') &&
    !cleanHost.includes('localhost') &&
    !cleanHost.includes('vercel.app')
  ) {
    // Custom domain (e.g. portal.rccg.org)
    communityHost = cleanHost
  }

  const requestHeaders = new Headers(request.headers)
  if (communitySlug) requestHeaders.set('x-community-slug', communitySlug)
  if (communityHost) requestHeaders.set('x-community-host', communityHost)

  const response = NextResponse.next({ request: { headers: requestHeaders } })
  if (communitySlug) response.cookies.set('community-slug', communitySlug, { path: '/', sameSite: 'lax' })
  if (communityHost) response.cookies.set('community-host', communityHost, { path: '/', sameSite: 'lax' })

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
