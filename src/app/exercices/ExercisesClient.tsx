'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ClipboardList, Tag, ChevronRight, Filter, Shuffle, AlertTriangle, HelpCircle } from 'lucide-react'
import { getDifficultyLabel, getDifficultyColor } from '@/lib/utils'
import MathText from '@/components/MathText'

interface Exercise {
  id: string
  lessonId: string
  title: string
  difficulty: number
  statement: string
  hints: string[]
  solutionSteps: { step: number; title: string; content: string }[]
  tags: string[]
}

interface Lesson {
  id: string
  title: string
  track: string
}

export default function ExercisesClient() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const [exercises, setExercises] = useState<Exercise[]>([])
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [loading, setLoading] = useState(true)

  const lessonFilter = searchParams.get('lesson') || ''
  const difficultyFilter = searchParams.get('difficulty') || ''

  useEffect(() => {
    async function loadData() {
      try {
        const [exercisesRes, lessonsRes] = await Promise.all([
          fetch('/api/exercises'),
          fetch('/api/lessons')
        ])

        if (exercisesRes.ok) {
          const data = await exercisesRes.json()
          setExercises(data)
        }

        if (lessonsRes.ok) {
          const data = await lessonsRes.json()
          setLessons(data)
        }
      } catch (error) {
        console.error('Error loading data:', error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const handleFilterChange = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    router.push(`/exercices?${params.toString()}`)
  }

  // Apply filters
  let filteredExercises = exercises

  if (lessonFilter) {
    filteredExercises = filteredExercises.filter((e) => e.lessonId === lessonFilter)
  }

  if (difficultyFilter) {
    const difficulty = parseInt(difficultyFilter)
    filteredExercises = filteredExercises.filter((e) => e.difficulty === difficulty)
  }

  // Group by difficulty
  const exercisesByDifficulty = filteredExercises.reduce((acc, exercise) => {
    const key = exercise.difficulty
    if (!acc[key]) acc[key] = []
    acc[key].push(exercise)
    return acc
  }, {} as Record<number, typeof filteredExercises>)

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 w-48 bg-slate-200 dark:bg-slate-700 rounded mb-4"></div>
            <div className="h-4 w-96 bg-slate-200 dark:bg-slate-700 rounded mb-8"></div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-40 bg-slate-200 dark:bg-slate-700 rounded-xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-3">
                <ClipboardList className="h-8 w-8 text-amber-600" />
                Exercices
              </h1>
              <p className="mt-2 text-slate-600 dark:text-slate-400">
                {exercises.length} exercices corrigés avec indices et solutions détaillées
              </p>
            </div>
            <div className="flex gap-2">
              <Link
                href="/exercices-aleatoires"
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg transition-colors"
              >
                <Shuffle className="h-4 w-4" />
                <span className="hidden sm:inline">Aléatoires</span>
              </Link>
              <Link
                href="/trouver-erreur"
                className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg transition-colors"
              >
                <AlertTriangle className="h-4 w-4" />
                <span className="hidden sm:inline">Trouver l'erreur</span>
              </Link>
              <Link
                href="/questions-conceptuelles"
                className="flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-lg transition-colors"
              >
                <HelpCircle className="h-4 w-4" />
                <span className="hidden sm:inline">Conceptuel</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
            <Filter className="h-4 w-4" />
            Filtrer :
          </div>

          <select
            value={lessonFilter}
            onChange={(e) => handleFilterChange('lesson', e.target.value)}
            className="input w-auto"
          >
            <option value="">Toutes les leçons</option>
            {lessons.map((lesson) => (
              <option key={lesson.id} value={lesson.id}>
                {lesson.title}
              </option>
            ))}
          </select>

          <select
            value={difficultyFilter}
            onChange={(e) => handleFilterChange('difficulty', e.target.value)}
            className="input w-auto"
          >
            <option value="">Toute difficulté</option>
            <option value="1">Facile</option>
            <option value="2">Accessible</option>
            <option value="3">Intermédiaire</option>
            <option value="4">Avancé</option>
            <option value="5">Expert</option>
          </select>

          {(lessonFilter || difficultyFilter) && (
            <Link
              href="/exercices"
              className="text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
            >
              Réinitialiser
            </Link>
          )}
        </div>

        {/* Results count */}
        <div className="mb-6 text-sm text-slate-600 dark:text-slate-400">
          {filteredExercises.length} exercice{filteredExercises.length > 1 ? 's' : ''} trouvé{filteredExercises.length > 1 ? 's' : ''}
        </div>

        {/* Exercises by difficulty */}
        {filteredExercises.length > 0 ? (
          <div className="space-y-8">
            {[1, 2, 3, 4, 5].map((difficulty) => {
              const exercisesForDifficulty = exercisesByDifficulty[difficulty]
              if (!exercisesForDifficulty || exercisesForDifficulty.length === 0) return null

              return (
                <div key={difficulty}>
                  <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-900 dark:text-slate-100">
                    <span className={`badge ${getDifficultyColor(difficulty)}`}>
                      {getDifficultyLabel(difficulty)}
                    </span>
                    <span className="text-slate-400 dark:text-slate-500 font-normal text-sm">
                      ({exercisesForDifficulty.length} exercice{exercisesForDifficulty.length > 1 ? 's' : ''})
                    </span>
                  </h2>

                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {exercisesForDifficulty.map((exercise) => {
                      const lesson = lessons.find((l) => l.id === exercise.lessonId)

                      return (
                        <Link
                          key={exercise.id}
                          href={`/exercices/${exercise.id}`}
                          className="card group hover:border-amber-200 dark:hover:border-amber-700 hover:shadow-md transition-all"
                        >
                          <div className="flex items-start justify-between">
                            <span className={`badge ${getDifficultyColor(exercise.difficulty)}`}>
                              {getDifficultyLabel(exercise.difficulty)}
                            </span>
                            <ChevronRight className="h-5 w-5 text-slate-400 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors" />
                          </div>

                          <h3 className="mt-3 font-semibold text-slate-900 dark:text-slate-100 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                            {exercise.title}
                          </h3>

                          <div className="mt-2 text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
                            <MathText text={exercise.statement.length > 120 ? exercise.statement.slice(0, 120) + '...' : exercise.statement} />
                          </div>

                          {lesson && (
                            <div className="mt-3 flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                              <Tag className="h-3 w-3" />
                              {lesson.title}
                            </div>
                          )}

                          <div className="mt-3 flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                            <span>{exercise.hints.length} indice{exercise.hints.length > 1 ? 's' : ''}</span>
                            <span>{exercise.solutionSteps.length} étape{exercise.solutionSteps.length > 1 ? 's' : ''}</span>
                          </div>
                        </Link>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <ClipboardList className="mx-auto h-12 w-12 text-slate-300 dark:text-slate-600" />
            <h3 className="mt-4 text-lg font-medium text-slate-900 dark:text-slate-100">
              Aucun exercice trouvé
            </h3>
            <p className="mt-2 text-slate-600 dark:text-slate-400">
              Essayez de modifier vos filtres
            </p>
            <Link
              href="/exercices"
              className="mt-4 inline-block text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
            >
              Réinitialiser les filtres
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
