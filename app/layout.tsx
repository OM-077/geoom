import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Geoom — AI Visibility for Home Service Contractors',
  description: 'Show up when homeowners ask ChatGPT for a contractor. Fix your AI visibility in 12 weeks.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
