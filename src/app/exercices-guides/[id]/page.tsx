'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Share2, Bookmark } from 'lucide-react'
import { GuidedExercise } from '@/components/GuidedExercise'
import { useGamificationStore } from '@/stores/gamificationStore'
import guidedExercisesData from '../../../../content/guided-exercises.json'

export default function GuidedExercisePage() {
  const params = useParams()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const { recordExerciseCompleted } = useGamificationStore()

  useEffect(() => {
    setMounted(true)
  }, [])

  const exerciseId = params.id as string
  const exercise = guidedExercisesData.guidedExercises.find(
    (ex) => ex.id === exerciseId
  )

  const handleComplete = () => {
    // Award points for completing a guided exercise
    recordExerciseCompleted(exerciseId, true)
  }

  if (!mounted) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-600 border-t-transparent" />
      </div>
    )
  }

  if (!exercise) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-8">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-xl border border-slate-200 bg-white p-12 text-center dark:border-slate-700 dark:bg-slate-800">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
              Exercice non trouvé
            </h2>
            <p className="mt-2 text-slate-600 dark:text-slate-400">
              L'exercice demandé n'existe pas.
            </p>
            <Link
              href="/exercices-guides"
              className="mt-4 inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 dark:text-primary-400"
            >
              <ArrowLeft className="h-4 w-4" />
              Retour aux exercices guidés
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-8">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        {/* Navigation */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/exercices-guides"
            className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour aux exercices
          </Link>

          <div className="flex items-center gap-2">
            <button
              className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
              title="Partager"
            >
              <Share2 className="h-5 w-5" />
            </button>
            <button
              className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
              title="Sauvegarder"
            >
              <Bookmark className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Guided Exercise Component */}
        <GuidedExercise exercise={exercise} onComplete={handleComplete} />

        {/* Navigation to other exercises */}
        <div className="mt-8 rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
          <h3 className="mb-4 font-semibold text-slate-900 dark:text-slate-100">
            Autres exercices sur ce thème
          </h3>
          <div className="space-y-2">
            {guidedExercisesData.guidedExercises
              .filter((ex) => ex.chapter === exercise.chapter && ex.id !== exercise.id)
              .slice(0, 3)
              .map((ex) => (
                <Link
                  key={ex.id}
                  href={`/exercices-guides/${ex.id}`}
                  className="flex items-center justify-between rounded-lg bg-slate-50 p-3 transition-colors hover:bg-slate-100 dark:bg-slate-800/50 dark:hover:bg-slate-700/50"
                >
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    {ex.title}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    {ex.difficulty}
                  </span>
                </Link>
              ))}
          </div>
          <Link
            href="/exercices-guides"
            className="mt-4 block text-center text-sm font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400"
          >
            Voir tous les exercices guidés
          </Link>
        </div>
      </div>
    </div>
  )
}
