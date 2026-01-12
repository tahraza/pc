'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  FileText,
  Calendar,
  Download,
  Eye,
  Filter,
  CheckCircle,
  MapPin,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import annalesData from '../../../content/annales-pdf.json'

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

export default function AnnalesPage() {
  const [mounted, setMounted] = useState(false)
  const [filterYear, setFilterYear] = useState<'all' | number>('all')
  const [filterCorrige, setFilterCorrige] = useState<'all' | 'with' | 'without'>('all')

  useEffect(() => {
    setMounted(true)
  }, [])

  const annales = annalesData.annales as Annale[]

  // Get unique years
  const years = Array.from(new Set(annales.map(a => a.year))).sort((a, b) => b - a)

  // Get unique sessions
  const sessions = Array.from(new Set(annales.map(a => a.session))).sort()

  const filteredAnnales = annales.filter(a => {
    if (filterYear !== 'all' && a.year !== filterYear) return false
    if (filterCorrige === 'with' && !a.hasCorrige) return false
    if (filterCorrige === 'without' && a.hasCorrige) return false
    return true
  })

  // Group by session for display
  const groupedBySession = sessions.reduce((acc, session) => {
    const sessionAnnales = filteredAnnales.filter(a => a.session === session)
    if (sessionAnnales.length > 0) {
      acc[session] = sessionAnnales
    }
    return acc
  }, {} as Record<string, Annale[]>)

  // Stats
  const totalSujets = annales.length
  const totalWithCorrige = annales.filter(a => a.hasCorrige).length

  if (!mounted) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-600 border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500 text-white">
              <FileText className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                Annales du Bac
              </h1>
              <p className="text-slate-600 dark:text-slate-400">
                {totalSujets} sujets disponibles dont {totalWithCorrige} avec corrigé
              </p>
            </div>
          </div>
        </div>

        {/* Info box */}
        <div className="mb-8 rounded-xl border border-amber-200 bg-amber-50 p-6 dark:border-amber-800 dark:bg-amber-900/20">
          <div className="flex items-start gap-4">
            <FileText className="h-6 w-6 flex-shrink-0 text-amber-600 dark:text-amber-400" />
            <div>
              <h3 className="font-semibold text-amber-900 dark:text-amber-100">
                Sujets officiels du Baccalauréat
              </h3>
              <p className="mt-1 text-sm text-amber-800 dark:text-amber-200">
                Retrouve ici les sujets officiels de Physique-Chimie tombés au Bac de 2022 à 2025.
                Tu peux consulter les sujets directement dans ton navigateur ou les télécharger pour t'entraîner.
              </p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-slate-500" />
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Filtrer :</span>
          </div>

          {/* Year filter */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilterYear('all')}
              className={cn(
                'rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
                filterYear === 'all'
                  ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
              )}
            >
              Toutes années
            </button>
            {years.map(year => (
              <button
                key={year}
                onClick={() => setFilterYear(year)}
                className={cn(
                  'rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
                  filterYear === year
                    ? 'bg-amber-600 text-white'
                    : 'bg-amber-100 text-amber-700 hover:bg-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:hover:bg-amber-900/50'
                )}
              >
                {year}
              </button>
            ))}
          </div>

          {/* Corrigé filter */}
          <div className="flex gap-2">
            <button
              onClick={() => setFilterCorrige('all')}
              className={cn(
                'rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
                filterCorrige === 'all'
                  ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
              )}
            >
              Tous
            </button>
            <button
              onClick={() => setFilterCorrige('with')}
              className={cn(
                'rounded-lg px-3 py-1.5 text-sm font-medium transition-colors flex items-center gap-1',
                filterCorrige === 'with'
                  ? 'bg-success-600 text-white'
                  : 'bg-success-100 text-success-700 hover:bg-success-200 dark:bg-success-900/30 dark:text-success-300 dark:hover:bg-success-900/50'
              )}
            >
              <CheckCircle className="h-3 w-3" />
              Avec corrigé
            </button>
          </div>
        </div>

        {/* Sessions grouped */}
        <div className="space-y-8">
          {Object.entries(groupedBySession).map(([session, sessionAnnales]) => (
            <div key={session}>
              <div className="mb-4 flex items-center gap-2">
                <MapPin className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                  {session}
                </h2>
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600 dark:bg-slate-700 dark:text-slate-400">
                  {sessionAnnales.length} sujet{sessionAnnales.length > 1 ? 's' : ''}
                </span>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {sessionAnnales.map((annale) => (
                  <div
                    key={annale.id}
                    className="rounded-xl border border-slate-200 bg-white p-5 transition-all hover:border-amber-300 hover:shadow-md dark:border-slate-700 dark:bg-slate-800 dark:hover:border-amber-600"
                  >
                    <div className="mb-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
                          <Calendar className="h-3 w-3" />
                          {annale.year}
                        </span>
                        <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                          Sujet {annale.number}
                        </span>
                      </div>
                      {annale.hasCorrige && (
                        <span className="flex items-center gap-1 rounded-full bg-success-100 px-2 py-0.5 text-xs font-medium text-success-700 dark:bg-success-900/30 dark:text-success-300">
                          <CheckCircle className="h-3 w-3" />
                          Corrigé
                        </span>
                      )}
                    </div>

                    <h3 className="mb-4 text-lg font-semibold text-slate-900 dark:text-slate-100">
                      {annale.session} - Sujet {annale.number}
                    </h3>

                    <div className="flex flex-wrap gap-2">
                      {/* View button */}
                      <Link
                        href={`/annales/${annale.id}`}
                        className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-amber-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-amber-700"
                      >
                        <Eye className="h-4 w-4" />
                        Consulter
                      </Link>

                      {/* Download sujet */}
                      {annale.sujetUrl && (
                        <a
                          href={annale.sujetUrl}
                          download
                          className="flex items-center justify-center gap-1 rounded-lg bg-slate-100 px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
                          title="Télécharger le sujet"
                        >
                          <Download className="h-4 w-4" />
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {filteredAnnales.length === 0 && (
          <div className="rounded-xl border border-slate-200 bg-white p-12 text-center dark:border-slate-700 dark:bg-slate-800">
            <FileText className="mx-auto h-12 w-12 text-slate-400" />
            <h3 className="mt-4 text-lg font-semibold text-slate-900 dark:text-slate-100">
              Aucune annale trouvée
            </h3>
            <p className="mt-2 text-slate-600 dark:text-slate-400">
              Essaie de modifier les filtres pour voir plus d'annales.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
