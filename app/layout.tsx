import type { Metadata } from 'next'
import { Noto_Sans_Devanagari } from 'next/font/google'
import './globals.css'

const notoSansDevanagari = Noto_Sans_Devanagari({
  subsets: ['devanagari'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-devanagari',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'CaseLine - AI Legal Case Management',
    template: '%s | CaseLine',
  },
  description: 'CaseLine is an AI-powered case management and bilingual agreement generation platform for law firms, courts, and in-house legal teams.',
  keywords: ['legal case management', 'agreement generator', 'rent agreement hindi english', 'law firm software', 'AI legal assistant'],
  authors: [{ name: 'CaseLine' }],
  creator: 'CaseLine',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning className={notoSansDevanagari.variable}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Noto+Sans+Devanagari:wght@400;500;600;700&family=Source+Serif+4:ital,opsz,wght@0,8..60,300;0,8..60,400;0,8..60,600;1,8..60,400&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5, viewport-fit=cover" />
        <meta name="theme-color" content="#0B1B33" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className={`antialiased ${notoSansDevanagari.variable}`}>
        {children}
      </body>
    </html>
  )
}
