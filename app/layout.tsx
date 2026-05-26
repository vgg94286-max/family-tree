import type { Metadata, Viewport } from 'next'
import { IBM_Plex_Sans_Arabic } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const ibmPlexArabic = IBM_Plex_Sans_Arabic({ 
  subsets: ["arabic", "latin"],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-ibm-plex-arabic'
})

export const metadata: Metadata = {
  title: ' شجرة آل شايق',
  description: 'شجرة العائلة التفاعلية لآل شايق - تصفح الأنساب وأضف أفراد العائلة',
  
  icons: {
    icon: [
      {
        url: '/lo.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/lo.png',
        media: '(prefers-color-scheme: dark)',
      },
      
    ],
    apple: '/lo.png',
  },
}

export const viewport: Viewport = {
  themeColor: '#1a2744',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ar" dir="rtl" className="bg-background">
      <body className={`${ibmPlexArabic.className} font-sans antialiased`}>
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
