'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  BookOpen,
  Clock,
  ChevronRight,
  Filter,
  FileText,
  Calendar,
  Award,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import annalesData from '../../../content/annales.json'

interface AnnalePreview {
  id: string
  year: number
  session: string
  exerciseNumber: number
  title: string
  subject: string
  themes: string[]
  points: number
  duration: number
  difficulty: string
  description: string
}

export default function AnnalesPage() {
  const [mounted, setMounted] = useState(false)
  const [filterYear, setFilterYear] = useState<'all' | number>('all')
  const [filterSubject, setFilterSubject] = useState<'all' | 'physique' | 'chimie'>('all')

  useEffect(() => {
    setMounted(true)
  }, [])

  const annales = annalesData.annales as AnnalePreview[]

  // Get unique years
  const years = Array.from(new Set(annales.map(a => a.year))).sort((a, b) => b - a)

  const filteredAnnales = annales.filter(a => {
    if (filterYear !== 'all' && a.year !== filterYear) return false
    if (filterSubject !== 'all' && a.subject !== filterSubject) return false
    return true
  })

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
                Entraîne-toi avec les sujets des années précédentes
              </p>
            </div>
          </div>
        </div>

        {/* Info box */}
        <div className="mb-8 rounded-xl border border-amber-200 bg-amber-50 p-6 dark:border-amber-800 dark:bg-amber-900/20">
          <div className="flex items-start gap-4">
            <Award className="h-6 w-6 flex-shrink-0 text-amber-600 dark:text-amber-400" />
            <div>
              <h3 className="font-semibold text-amber-900 dark:text-amber-100">
                Prépare-toi efficacement au Bac
              </h3>
              <p className="mt-1 text-sm text-amber-800 dark:text-amber-200">
                Les annales sont des sujets tombés aux épreuves du baccalauréat. Chaque exercice comporte
                une <strong>correction détaillée</strong> pour t'aider à comprendre la méthode de résolution.
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

          <div className="flex gap-2">
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

          <div className="flex gap-2">
            <button
              onClick={() => setFilterSubject('all')}
              className={cn(
                'rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
                filterSubject === 'all'
                  ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
              )}
            >
              Toutes matières
            </button>
            <button
              onClick={() => setFilterSubject('physique')}
              className={cn(
                'rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
                filterSubject === 'physique'
                  ? 'bg-primary-600 text-white'
                  : 'bg-primary-100 text-primary-700 hover:bg-primary-200 dark:bg-primary-900/30 dark:text-primary-300 dark:hover:bg-primary-900/50'
              )}
            >
              Physique
            </button>
            <button
              onClick={() => setFilterSubject('chimie')}
              className={cn(
                'rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
                filterSubject === 'chimie'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:hover:bg-emerald-900/50'
              )}
            >
              Chimie
            </button>
          </div>
        </div>

        {/* Annales list */}
        <div className="space-y-4">
          {filteredAnnales.map((annale) => (
            <Link
              key={annale.id}
              href={`/annales/${annale.id}`}
              className="group block rounded-xl border border-slate-200 bg-white p-5 transition-all hover:border-amber-300 hover:shadow-md dark:border-slate-700 dark:bg-slate-800 dark:hover:border-amber-600"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex-1">
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <span className="flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
                      <Calendar className="h-3 w-3" />
                      {annale.year}
                    </span>
                    <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                      {annale.session}
                    </span>
                    <span className={cn(
                      'rounded-full px-2.5 py-0.5 text-xs font-medium',
                      annale.subject === 'physique'
                        ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300'
                        : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
                    )}>
                      {annale.subject === 'physique' ? 'Physique' : 'Chimie'}
                    </span>
                    <span className={cn(
                      'rounded-full px-2.5 py-0.5 text-xs font-medium',
                      annale.difficulty === 'facile' && 'bg-success-100 text-success-700 dark:bg-success-900/30 dark:text-success-300',
                      annale.difficulty === 'moyen' && 'bg-warning-100 text-warning-700 dark:bg-warning-900/30 dark:text-warning-300',
                      annale.difficulty === 'difficile' && 'bg-danger-100 text-danger-700 dark:bg-danger-900/30 dark:text-danger-300'
                    )}>
                      {annale.difficulty}
                    </span>
                  </div>

                  <h3 className="text-lg font-semibold text-slate-900 group-hover:text-amber-600 dark:text-slate-100 dark:group-hover:text-amber-400">
                    Exercice {annale.exerciseNumber} : {annale.title}
                  </h3>

                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                    {annale.description}
                  </p>

                  <div className="mt-3 flex flex-wrap gap-1">
                    {annale.themes.map(theme => (
                      <span
                        key={theme}
                        className="rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-600 dark:bg-slate-700 dark:text-slate-400"
                      >
                        {theme}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-6 sm:flex-col sm:items-end sm:gap-2">
                  <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1">
                      <Award className="h-4 w-4" />
                      {annale.points} pts
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      ~{annale.duration} min
                    </span>
                  </div>
                  <span className="flex items-center gap-1 text-sm font-medium text-amber-600 group-hover:text-amber-700 dark:text-amber-400">
                    Voir l'exercice
                    <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {filteredAnnales.length === 0 && (
          <div className="rounded-xl border border-slate-200 bg-white p-12 text-center dark:border-slate-700 dark:bg-slate-800">
            <BookOpen className="mx-auto h-12 w-12 text-slate-400" />
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
