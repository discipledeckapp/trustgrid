'use client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { useState } from 'react'

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? ''

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () => new QueryClient({ defaultOptions: { queries: { retry: 1, staleTime: 30_000 } } }),
  )

  const inner = (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )

  // Only wrap with GoogleOAuthProvider when a client ID is actually configured.
  // An empty clientId causes useGoogleOAuth() to throw inside GoogleSignInButton
  // which crashes the entire app via the global error boundary.
  if (!GOOGLE_CLIENT_ID) return inner

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      {inner}
    </GoogleOAuthProvider>
  )
}
