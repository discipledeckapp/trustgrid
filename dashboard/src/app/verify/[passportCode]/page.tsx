/**
 * Public Trust Passport verification page.
 * URL: app.trustgrid.ng/verify/TGP-XXXXXXXX
 * Accessible without login — used when scanning a QR code or sharing a passport link.
 */

import { Suspense } from 'react'
import PublicVerifyClient from './PublicVerifyClient'

export default function VerifyPage({ params }: { params: { passportCode: string } }) {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-950 to-cyan-950">
        <div className="animate-spin w-10 h-10 border-2 border-white/40 border-t-white rounded-full" />
      </div>
    }>
      <PublicVerifyClient passportCode={params.passportCode} />
    </Suspense>
  )
}
