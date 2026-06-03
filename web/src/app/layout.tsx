import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'TrustGrid — The Trust Operating System for Communities',
  description: 'TrustGrid enables estates, churches, schools, and smart cities to verify, deploy, and govern trusted service workers. Built for Nigerian institutions.',
  keywords: 'workforce governance, worker verification, trust score, Nigeria, estates, RCCG, smart city, community workforce',
  openGraph: {
    title: 'TrustGrid — Trusted People. Accountable Service. Stronger Communities.',
    description: 'The community workforce governance platform for Nigerian institutions. Verify workers, track performance, build permanent institutional memory.',
    url: 'https://trustgrid.ng',
    siteName: 'TrustGrid',
    locale: 'en_NG',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TrustGrid',
    description: 'Trusted People. Accountable Service. Stronger Communities.',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="scroll-smooth">
      {/* Inline script runs before paint — reads saved theme and applies 'dark' class instantly, no flash */}
      <head>
        <script dangerouslySetInnerHTML={{ __html: `
          (function() {
            try {
              var t = localStorage.getItem('tg-theme');
              if (t === 'dark') document.documentElement.classList.add('dark');
            } catch(e) {}
          })();
        `}} />
      </head>
      <body>{children}</body>
    </html>
  )
}
