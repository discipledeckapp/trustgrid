import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'TrustGrid — Trusted People. Accountable Service. Stronger Communities.',
  description: 'The workforce governance platform for estates, churches, schools, and smart cities. Verify workers, track performance, manage trust.',
  keywords: 'workforce governance, worker verification, trust score, Nigeria, estates, RCCG, smart city',
  openGraph: {
    title: 'TrustGrid',
    description: 'Trusted People. Accountable Service. Stronger Communities.',
    url: 'https://trustgrid.ng',
    siteName: 'TrustGrid',
    locale: 'en_NG',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
