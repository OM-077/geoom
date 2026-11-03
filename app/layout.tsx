import type { Metadata, Viewport } from 'next'
import { Chakra_Petch, JetBrains_Mono, Inter } from 'next/font/google'
import './globals.css'

const chakraPetch = Chakra_Petch({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  variable: '--font-chakra',
  display: 'swap'
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-mono',
  display: 'swap'
})

const inter = Inter({
  subsets: ['latin'],
  weight: ['500', '700'],
  variable: '--font-inter',
  display: 'swap'
})

export const metadata: Metadata = {
  title: {
    default: 'GeoOm — AI Visibility for Home Service Contractors',
    template: '%s | GeoOm'
  },
  description: 'Find out who is stealing your local AI searches. Fix your AI visibility in 48 hours.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://geoom.site'),
  openGraph: {
    type: 'website',
    siteName: 'GeoOm',
    title: 'GeoOm — AI Visibility for Home Service Contractors',
    description: 'Find out who is stealing your local AI searches.'
  },
  robots: { index: true, follow: true }
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#07090C'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${chakraPetch.variable} ${jetbrainsMono.variable} ${inter.variable}`}
    >
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <link
          rel="icon"
          href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>⚡</text></svg>"
        />
      </head>
      <body style={{
        margin: 0,
        padding: 0,
        background: '#07090C',
        color: '#F0F4F8',
        fontFamily: 'var(--font-inter), sans-serif',
        WebkitFontSmoothing: 'antialiased'
      }}>
        {children}
      </body>
    </html>
  )
}
