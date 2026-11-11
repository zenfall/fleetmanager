import type { Metadata } from 'next'
import { Analytics } from '@vercel/analytics/next'
import { AuthProvider } from '@/lib/auth-context'
import { Toaster } from '@/components/ui/sonner'
import './globals.css'

export const metadata: Metadata = {
  title: 'FleetManager - Gestion de Flotte',
  description: 'Application de suivi de flotte automobile - Versements, Vidanges, GPS, Dépenses',
  generator: 'v0.app',
  // Outil interne : ne doit pas apparaitre dans les moteurs de recherche
  robots: { index: false, follow: false },
  icons: {
    icon: [{ url: '/icon-32.png', type: 'image/png', sizes: '32x32' }],
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="fr" className="bg-background">
      <body className="font-sans antialiased">
        <AuthProvider>
          {children}
          <Toaster />
        </AuthProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
