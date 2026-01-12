'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  Calendar,
  Download,
  FileText,
  CheckCircle,
  MapPin,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import PDFViewer from '@/components/PDFViewer'
import annalesData from '../../../../content/annales-pdf.json'

interface Annale {
  id: string
  year: number
  sessionId: string
  session: string
  number: number
  sujetFile: string | null
  corrigeFile: string | null
  hasCorrige: boolean
  sujetUrl: string | null
  corrigeUrl: string | null
}

export default function AnnalePage() {
  const params = useParams()
  const [mounted, setMounted] = useState(false)
  const [activeTab, setActiveTab] = useState<'sujet' | 'corrige'>('sujet')

  useEffect(() => {
    setMounted(true)
  }, [])

  const annaleId = params.id as string
  const annales = annalesData.annales as Annale[]
  const annale = annales.find((a) => a.id === annaleId)

  // Find prev/next annales from same session
  const sameSession = annales.filter(a => a.session === annale?.session && a.year === annale?.year)
  const currentIndex = sameSession.findIndex(a => a.id === annaleId)
  const prevAnnale = currentIndex > 0 ? sameSession[currentIndex - 1] : null
  const nextAnnale = currentIndex < sameSession.length - 1 ? sameSession[currentIndex + 1] : null

  // Other annales from same year
  const otherAnnales = annales
    .filter(a => a.year === annale?.year && a.id !== annaleId)
    .slice(0, 6)

  if (!mounted) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-600 border-t-transparent" />
      </div>
    )
  }

  if (!annale) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-8">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-xl border border-slate-200 bg-white p-12 text-center dark:border-slate-700 dark:bg-slate-800">
            <FileText className="mx-auto h-12 w-12 text-slate-400" />
            <h2 className="mt-4 text-xl font-semibold text-slate-900 dark:text-slate-100">
              Annale non trouvée
            </h2>
            <p className="mt-2 text-slate-600 dark:text-slate-400">
              L'annale demandée n'existe pas.
            </p>
            <Link
              href="/annales"
              className="mt-4 inline-flex items-center gap-2 text-amber-600 hover:text-amber-700 dark:text-amber-400"
            >
              <ArrowLeft className="h-4 w-4" />
              Retour aux annales
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-8">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Navigation */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/annales"
            className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour aux annales
          </Link>

          {/* Prev/Next navigation */}
          <div className="flex items-center gap-2">
            {prevAnnale ? (
              <Link
                href={`/annales/${prevAnnale.id}`}
                className="flex items-center gap-1 rounded-lg bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
              >
                <ChevronLeft className="h-4 w-4" />
                Sujet {prevAnnale.number}
              </Link>
            ) : (
              <span className="flex items-center gap-1 rounded-lg bg-slate-50 px-3 py-1.5 text-sm text-slate-400 dark:bg-slate-800/50 dark:text-slate-600">
                <ChevronLeft className="h-4 w-4" />
                Sujet préc.
              </span>
            )}
            {nextAnnale ? (
              <Link
                href={`/annales/${nextAnnale.id}`}
                className="flex items-center gap-1 rounded-lg bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
              >
                Sujet {nextAnnale.number}
                <ChevronRight className="h-4 w-4" />
              </Link>
            ) : (
              <span className="flex items-center gap-1 rounded-lg bg-slate-50 px-3 py-1.5 text-sm text-slate-400 dark:bg-slate-800/50 dark:text-slate-600">
                Sujet suiv.
                <ChevronRight className="h-4 w-4" />
              </span>
            )}
          </div>
        </div>

        {/* Header */}
        <div className="mb-6 rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <span className="flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 text-sm font-semibold text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
              <Calendar className="h-4 w-4" />
              Bac {annale.year}
            </span>
            <span className="flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-600 dark:bg-slate-700 dark:text-slate-300">
              <MapPin className="h-4 w-4" />
              {annale.session}
            </span>
            <span className="rounded-full bg-primary-100 px-3 py-1 text-sm font-medium text-primary-700 dark:bg-primary-900/30 dark:text-primary-300">
              Sujet {annale.number}
            </span>
            {annale.hasCorrige && (
              <span className="flex items-center gap-1 rounded-full bg-success-100 px-3 py-1 text-sm font-medium text-success-700 dark:bg-success-900/30 dark:text-success-300">
                <CheckCircle className="h-4 w-4" />
                Corrigé disponible
              </span>
            )}
          </div>

          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            {annale.session} {annale.year} - Sujet {annale.number}
          </h1>

          {/* Download buttons */}
          <div className="mt-4 flex flex-wrap gap-3">
            {annale.sujetUrl && (
              <a
                href={annale.sujetUrl}
                download
                className="flex items-center gap-2 rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-amber-700"
              >
                <Download className="h-4 w-4" />
                Télécharger le sujet
              </a>
            )}
            {annale.corrigeUrl && (
              <a
                href={annale.corrigeUrl}
                download
                className="flex items-center gap-2 rounded-lg bg-success-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-success-700"
              >
                <Download className="h-4 w-4" />
                Télécharger le corrigé
              </a>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-4 flex gap-2">
          <button
            onClick={() => setActiveTab('sujet')}
            className={cn(
              'flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors',
              activeTab === 'sujet'
                ? 'bg-amber-600 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
            )}
          >
            <FileText className="h-4 w-4" />
            Sujet
          </button>
          {annale.hasCorrige && (
            <button
              onClick={() => setActiveTab('corrige')}
              className={cn(
                'flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors',
                activeTab === 'corrige'
                  ? 'bg-success-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
              )}
            >
              <CheckCircle className="h-4 w-4" />
              Corrigé
            </button>
          )}
        </div>

        {/* PDF Viewer */}
        {activeTab === 'sujet' && annale.sujetUrl && (
          <PDFViewer
            url={annale.sujetUrl}
            title={`Sujet - ${annale.session} ${annale.year}`}
          />
        )}
        {activeTab === 'corrige' && annale.corrigeUrl && (
          <PDFViewer
            url={annale.corrigeUrl}
            title={`Corrigé - ${annale.session} ${annale.year}`}
          />
        )}

        {/* No corrigé message */}
        {activeTab === 'corrige' && !annale.corrigeUrl && (
          <div className="rounded-xl border border-slate-200 bg-white p-12 text-center dark:border-slate-700 dark:bg-slate-800">
            <FileText className="mx-auto h-12 w-12 text-slate-400" />
            <h3 className="mt-4 text-lg font-semibold text-slate-900 dark:text-slate-100">
              Corrigé non disponible
            </h3>
            <p className="mt-2 text-slate-600 dark:text-slate-400">
              Le corrigé de ce sujet n'est pas encore disponible.
            </p>
          </div>
        )}

        {/* Other annales */}
        {otherAnnales.length > 0 && (
          <div className="mt-8 rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
            <h3 className="mb-4 font-semibold text-slate-900 dark:text-slate-100">
              Autres sujets de {annale.year}
            </h3>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {otherAnnales.map((a) => (
                <Link
                  key={a.id}
                  href={`/annales/${a.id}`}
                  className="flex items-center justify-between rounded-lg bg-slate-50 p-3 transition-colors hover:bg-slate-100 dark:bg-slate-800/50 dark:hover:bg-slate-700/50"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      {a.session}
                    </span>
                    <span className="rounded bg-slate-200 px-1.5 py-0.5 text-xs text-slate-600 dark:bg-slate-700 dark:text-slate-400">
                      #{a.number}
                    </span>
                  </div>
                  {a.hasCorrige && (
                    <CheckCircle className="h-4 w-4 text-success-600 dark:text-success-400" />
                  )}
                </Link>
              ))}
            </div>
            <Link
              href="/annales"
              className="mt-4 block text-center text-sm font-medium text-amber-600 hover:text-amber-700 dark:text-amber-400"
            >
              Voir toutes les annales
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
