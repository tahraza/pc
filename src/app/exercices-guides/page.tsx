'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  BookOpen,
  Clock,
  ChevronRight,
  Filter,
  GraduationCap,
  Sparkles,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import guidedExercisesData from '../../../content/guided-exercises.json'

interface GuidedExercisePreview {
  id: string
  title: string
  subject: string
  chapter: string
  difficulty: string
  estimatedTime: number
  description: string
}

export default function GuidedExercisesPage() {
  const [mounted, setMounted] = useState(false)
  const [filterSubject, setFilterSubject] = useState<'all' | 'physique' | 'chimie'>('all')
  const [filterDifficulty, setFilterDifficulty] = useState<'all' | 'facile' | 'moyen' | 'difficile'>('all')

  useEffect(() => {
    setMounted(true)
  }, [])

  const exercises = guidedExercisesData.guidedExercises as GuidedExercisePreview[]

  const filteredExercises = exercises.filter(ex => {
    if (filterSubject !== 'all' && ex.subject !== filterSubject) return false
    if (filterDifficulty !== 'all' && ex.difficulty !== filterDifficulty) return false
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
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-600 text-white">
              <GraduationCap className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                Exercices guidés
              </h1>
              <p className="text-slate-600 dark:text-slate-400">
                Résous des exercices pas à pas avec des indices et des solutions
              </p>
            </div>
          </div>
        </div>

        {/* Info box */}
        <div className="mb-8 rounded-xl border border-primary-200 bg-primary-50 p-6 dark:border-primary-800 dark:bg-primary-900/20">
          <div className="flex items-start gap-4">
            <Sparkles className="h-6 w-6 flex-shrink-0 text-primary-600 dark:text-primary-400" />
            <div>
              <h3 className="font-semibold text-primary-900 dark:text-primary-100">
                Comment ça marche ?
              </h3>
              <p className="mt-1 text-sm text-primary-800 dark:text-primary-200">
                Chaque exercice est décomposé en plusieurs étapes. Tu peux demander un <strong>indice</strong> si tu bloques,
                ou voir la <strong>solution</strong> de l'étape avant de passer à la suivante. Gagne des points en complétant les exercices !
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
              onClick={() => setFilterSubject('all')}
              className={cn(
                'rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
                filterSubject === 'all'
                  ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
              )}
            >
              Tous
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

          <div className="flex gap-2">
            <button
              onClick={() => setFilterDifficulty('all')}
              className={cn(
                'rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
                filterDifficulty === 'all'
                  ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
              )}
            >
              Toutes difficultés
            </button>
            <button
              onClick={() => setFilterDifficulty('facile')}
              className={cn(
                'rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
                filterDifficulty === 'facile'
                  ? 'bg-success-600 text-white'
                  : 'bg-success-100 text-success-700 hover:bg-success-200 dark:bg-success-900/30 dark:text-success-300'
              )}
            >
              Facile
            </button>
            <button
              onClick={() => setFilterDifficulty('moyen')}
              className={cn(
                'rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
                filterDifficulty === 'moyen'
                  ? 'bg-warning-600 text-white'
                  : 'bg-warning-100 text-warning-700 hover:bg-warning-200 dark:bg-warning-900/30 dark:text-warning-300'
              )}
            >
              Moyen
            </button>
            <button
              onClick={() => setFilterDifficulty('difficile')}
              className={cn(
                'rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
                filterDifficulty === 'difficile'
                  ? 'bg-danger-600 text-white'
                  : 'bg-danger-100 text-danger-700 hover:bg-danger-200 dark:bg-danger-900/30 dark:text-danger-300'
              )}
            >
              Difficile
            </button>
          </div>
        </div>

        {/* Exercise list */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredExercises.map((exercise) => (
            <Link
              key={exercise.id}
              href={`/exercices-guides/${exercise.id}`}
              className="group rounded-xl border border-slate-200 bg-white p-5 transition-all hover:border-primary-300 hover:shadow-md dark:border-slate-700 dark:bg-slate-800 dark:hover:border-primary-600"
            >
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <span className={cn(
                  'rounded-full px-2.5 py-0.5 text-xs font-medium',
                  exercise.subject === 'physique'
                    ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300'
                    : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
                )}>
                  {exercise.subject === 'physique' ? 'Physique' : 'Chimie'}
                </span>
                <span className={cn(
                  'rounded-full px-2.5 py-0.5 text-xs font-medium',
                  exercise.difficulty === 'facile' && 'bg-success-100 text-success-700 dark:bg-success-900/30 dark:text-success-300',
                  exercise.difficulty === 'moyen' && 'bg-warning-100 text-warning-700 dark:bg-warning-900/30 dark:text-warning-300',
                  exercise.difficulty === 'difficile' && 'bg-danger-100 text-danger-700 dark:bg-danger-900/30 dark:text-danger-300'
                )}>
                  {exercise.difficulty}
                </span>
              </div>

              <h3 className="mb-2 font-semibold text-slate-900 group-hover:text-primary-600 dark:text-slate-100 dark:group-hover:text-primary-400">
                {exercise.title}
              </h3>

              <p className="mb-3 text-sm text-slate-500 dark:text-slate-400">{exercise.chapter}</p>

              <p className="mb-4 line-clamp-2 text-sm text-slate-600 dark:text-slate-400">
                {exercise.description}
              </p>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                  <Clock className="h-3.5 w-3.5" />
                  ~{exercise.estimatedTime} min
                </div>
                <span className="flex items-center gap-1 text-sm font-medium text-primary-600 group-hover:text-primary-700 dark:text-primary-400">
                  Commencer
                  <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </span>
              </div>
            </Link>
          ))}
        </div>

        {filteredExercises.length === 0 && (
          <div className="rounded-xl border border-slate-200 bg-white p-12 text-center dark:border-slate-700 dark:bg-slate-800">
            <BookOpen className="mx-auto h-12 w-12 text-slate-400" />
            <h3 className="mt-4 text-lg font-semibold text-slate-900 dark:text-slate-100">
              Aucun exercice trouvé
            </h3>
            <p className="mt-2 text-slate-600 dark:text-slate-400">
              Essaie de modifier les filtres pour voir plus d'exercices.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
