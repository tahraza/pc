import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Navigation } from '@/components/Navigation'
import { Footer } from '@/components/Footer'
import { ThemeProvider } from '@/components/ThemeProvider'
import { GamificationMigration } from '@/components/GamificationMigration'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Physique-Chimie Terminale | Révision Bac',
  description: 'Plateforme interactive pour réviser la physique-chimie de Terminale : cours complets, exercices corrigés, QCM, flashcards et suivi de progression.',
  keywords: ['physique', 'chimie', 'terminale', 'bac', 'révision', 'exercices', 'cours', 'ondes', 'mécanique'],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css"
          integrity="sha384-n8MVd4RsNIU0tAv4ct0nTaAbDJwPJzDEaqSD1odI+WdtXRGWt2kTvGFasHpSy3SV"
          crossOrigin="anonymous"
        />
      </head>
      <body className={`${inter.className} min-h-screen flex flex-col`}>
        <ThemeProvider>
          <Navigation />
          <main className="flex-1">
            {children}
          </main>
          <Footer />
          <GamificationMigration />
        </ThemeProvider>
      </body>
    </html>
  )
}
