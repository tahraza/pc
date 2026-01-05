'use client'

import { useEffect, useState } from 'react'
import { useStore } from '@/store/useStore'
import { useGamificationStore } from '@/stores/gamificationStore'

export function GamificationMigration() {
  const [migrationResult, setMigrationResult] = useState<{
    migratedLessons: number
    migratedExercises: number
    migratedQuizzes: number
    totalPoints: number
  } | null>(null)
  const [showNotification, setShowNotification] = useState(false)

  const { lessonProgress, exerciseProgress, quizAttempts } = useStore()
  const { migrateFromProgressData, migrationVersion } = useGamificationStore()

  useEffect(() => {
    // Ne pas migrer si déjà fait
    if (migrationVersion >= 1) {
      return
    }

    // Attendre que les stores soient hydratés
    const timer = setTimeout(() => {
      const result = migrateFromProgressData({
        lessonProgress,
        exerciseProgress,
        quizAttempts,
      })

      if (result.totalPoints > 0) {
        setMigrationResult(result)
        setShowNotification(true)

        // Cacher la notification après 5 secondes
        setTimeout(() => {
          setShowNotification(false)
        }, 5000)
      }
    }, 1000) // Attendre 1 seconde pour l'hydratation

    return () => clearTimeout(timer)
  }, [migrationVersion, lessonProgress, exerciseProgress, quizAttempts, migrateFromProgressData])

  if (!showNotification || !migrationResult) {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm animate-slide-up">
      <div className="rounded-lg border border-success-200 bg-success-50 p-4 shadow-lg dark:border-success-800 dark:bg-success-900/30">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-success-100 dark:bg-success-800">
            <span className="text-xl">🎉</span>
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-success-900 dark:text-success-100">
              Points récupérés !
            </h3>
            <p className="mt-1 text-sm text-success-700 dark:text-success-300">
              +{migrationResult.totalPoints} points ajoutés rétroactivement
            </p>
            <ul className="mt-2 text-xs text-success-600 dark:text-success-400">
              {migrationResult.migratedLessons > 0 && (
                <li>• {migrationResult.migratedLessons} leçon(s) maîtrisée(s)</li>
              )}
              {migrationResult.migratedExercises > 0 && (
                <li>• {migrationResult.migratedExercises} exercice(s) complété(s)</li>
              )}
              {migrationResult.migratedQuizzes > 0 && (
                <li>• {migrationResult.migratedQuizzes} QCM passé(s)</li>
              )}
            </ul>
          </div>
          <button
            onClick={() => setShowNotification(false)}
            className="text-success-500 hover:text-success-700 dark:text-success-400 dark:hover:text-success-200"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  )
}
