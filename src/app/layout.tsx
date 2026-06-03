import type { Metadata } from 'next'
import { Inter, Geist_Mono } from 'next/font/google'
import './globals.css'
import { TooltipProvider } from '@/components/ui/tooltip'
import { AuthProvider } from '@/contexts/AuthContext'

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  display: 'swap',
  weight: ['300', '400', '500', '600', '700', '800', '900'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: {
    default: 'Greifenberg RP',
    template: '%s | Greifenberg RP',
  },
  description:
    'Das führende deutschsprachige FiveM Roleplay-Projekt. Erlebe authentisches, immersives Roleplay auf Greifenberg RP.',
  keywords: ['FiveM', 'Roleplay', 'RP', 'Greifenberg', 'GTA', 'ESX'],
  openGraph: {
    title: 'Greifenberg RP',
    description: 'Das führende deutschsprachige FiveM Roleplay-Projekt.',
    url: 'https://greifenberg-rp.de',
    siteName: 'Greifenberg RP',
    locale: 'de_DE',
    type: 'website',
  },
  robots: { index: true, follow: true },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="de"
      className={`${inter.variable} ${geistMono.variable} h-full`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-background text-foreground antialiased">
        <TooltipProvider>
          <AuthProvider>{children}</AuthProvider>
        </TooltipProvider>
      </body>
    </html>
  )
}
