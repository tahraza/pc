'use client'

import { useState, useRef } from 'react'
import { Download, Upload, AlertTriangle, CheckCircle2, X, Save, RotateCcw } from 'lucide-react'
import { useStore } from '@/store/useStore'
import { useGamificationStore } from '@/stores/gamificationStore'
import { usePetStore } from '@/stores/petStore'
import { useChallengesStore } from '@/stores/challengesStore'

interface BackupData {
  version: string
  exportDate: string
  mainStore: any
  gamificationStore: any
  petStore: any
  challengesStore: any
}

export function ProgressBackup() {
  const [showModal, setShowModal] = useState(false)
  const [importStatus, setImportStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [importMessage, setImportMessage] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const mainStore = useStore()
  const gamificationStore = useGamificationStore()
  const petStore = usePetStore()
  const challengesStore = useChallengesStore()

  const handleExport = () => {
    // Gather all data from stores
    const backupData: BackupData = {
      version: '1.0',
      exportDate: new Date().toISOString(),
      mainStore: {
        lessonProgress: mainStore.lessonProgress,
        exerciseProgress: mainStore.exerciseProgress,
        flashcardProgress: mainStore.flashcardProgress,
        quizAttempts: mainStore.quizAttempts,
        stats: mainStore.stats,
        dailyActivities: mainStore.dailyActivities,
        preferences: mainStore.preferences,
      },
      gamificationStore: {
        totalPoints: gamificationStore.totalPoints,
        pointsHistory: gamificationStore.pointsHistory,
        currentStreak: gamificationStore.currentStreak,
        longestStreak: gamificationStore.longestStreak,
        lastActivityDate: gamificationStore.lastActivityDate,
        unlockedBadges: gamificationStore.unlockedBadges,
        achievements: gamificationStore.achievements,
        dailyActivities: gamificationStore.dailyActivities,
        totalLessonsCompleted: gamificationStore.totalLessonsCompleted,
        totalExercisesCompleted: gamificationStore.totalExercisesCompleted,
        totalQuizzesCompleted: gamificationStore.totalQuizzesCompleted,
        totalCorrectAnswers: gamificationStore.totalCorrectAnswers,
      },
      petStore: {
        selectedPetId: petStore.selectedPetId,
        petName: petStore.petName,
        currentPoints: petStore.currentPoints,
      },
      challengesStore: {
        activeChallenges: challengesStore.activeChallenges,
        completedChallenges: challengesStore.completedChallenges,
        lastRefresh: challengesStore.lastRefresh,
      },
    }

    // Create and download file
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `physique-chimie-sauvegarde-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    setImportStatus('success')
    setImportMessage('Sauvegarde exportée avec succès !')
    setTimeout(() => setImportStatus('idle'), 3000)
  }

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string) as BackupData

        // Validate backup data
        if (!data.version || !data.exportDate) {
          throw new Error('Format de fichier invalide')
        }

        // Restore main store using importData method
        if (data.mainStore) {
          mainStore.importData(data.mainStore)
        }

        // Restore gamification store (via localStorage since Zustand persist)
        if (data.gamificationStore) {
          const gamificationData = {
            state: data.gamificationStore,
            version: 0
          }
          localStorage.setItem('physique-chimie-gamification', JSON.stringify(gamificationData))
        }

        // Restore pet store
        if (data.petStore) {
          const petData = {
            state: data.petStore,
            version: 0
          }
          localStorage.setItem('physique-chimie-pet', JSON.stringify(petData))
        }

        // Restore challenges store
        if (data.challengesStore) {
          const challengesData = {
            state: data.challengesStore,
            version: 0
          }
          localStorage.setItem('physique-chimie-challenges', JSON.stringify(challengesData))
        }

        setImportStatus('success')
        setImportMessage(`Progression restaurée depuis la sauvegarde du ${new Date(data.exportDate).toLocaleDateString('fr-FR')}. Rechargez la page pour voir les changements.`)

        // Reset file input
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }

      } catch (error) {
        setImportStatus('error')
        setImportMessage('Erreur lors de l\'importation. Vérifiez que le fichier est valide.')
        console.error('Import error:', error)
      }
    }
    reader.readAsText(file)
  }

  const handleReset = () => {
    if (confirm('Êtes-vous sûr de vouloir réinitialiser toute votre progression ? Cette action est irréversible.')) {
      // Clear all localStorage
      localStorage.removeItem('physique-chimie-store')
      localStorage.removeItem('physique-chimie-gamification')
      localStorage.removeItem('physique-chimie-pet')
      localStorage.removeItem('physique-chimie-challenges')

      setImportStatus('success')
      setImportMessage('Progression réinitialisée. Rechargez la page.')

      setTimeout(() => {
        window.location.reload()
      }, 1500)
    }
  }

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
      >
        <Save className="h-4 w-4" />
        Sauvegarder / Restaurer
      </button>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-slate-800">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                Gestion de la progression
              </h2>
              <button
                onClick={() => {
                  setShowModal(false)
                  setImportStatus('idle')
                }}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Status message */}
            {importStatus !== 'idle' && (
              <div className={`mb-4 flex items-center gap-2 rounded-lg p-3 ${
                importStatus === 'success'
                  ? 'bg-success-50 text-success-700 dark:bg-success-900/20 dark:text-success-300'
                  : 'bg-danger-50 text-danger-700 dark:bg-danger-900/20 dark:text-danger-300'
              }`}>
                {importStatus === 'success' ? (
                  <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
                ) : (
                  <AlertTriangle className="h-5 w-5 flex-shrink-0" />
                )}
                <p className="text-sm">{importMessage}</p>
              </div>
            )}

            <div className="space-y-4">
              {/* Export */}
              <div className="rounded-lg border border-slate-200 p-4 dark:border-slate-700">
                <div className="mb-3 flex items-center gap-2">
                  <Download className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                  <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                    Sauvegarder
                  </h3>
                </div>
                <p className="mb-3 text-sm text-slate-600 dark:text-slate-400">
                  Télécharge un fichier contenant toute ta progression (points, badges, animal, exercices complétés...).
                </p>
                <button
                  onClick={handleExport}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-700"
                >
                  <Download className="h-4 w-4" />
                  Télécharger la sauvegarde
                </button>
              </div>

              {/* Import */}
              <div className="rounded-lg border border-slate-200 p-4 dark:border-slate-700">
                <div className="mb-3 flex items-center gap-2">
                  <Upload className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                    Restaurer
                  </h3>
                </div>
                <p className="mb-3 text-sm text-slate-600 dark:text-slate-400">
                  Importe une sauvegarde précédente pour récupérer ta progression.
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json"
                  onChange={handleImport}
                  className="hidden"
                  id="backup-file-input"
                />
                <label
                  htmlFor="backup-file-input"
                  className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-700"
                >
                  <Upload className="h-4 w-4" />
                  Choisir un fichier
                </label>
              </div>

              {/* Reset */}
              <div className="rounded-lg border border-danger-200 bg-danger-50 p-4 dark:border-danger-800 dark:bg-danger-900/20">
                <div className="mb-3 flex items-center gap-2">
                  <RotateCcw className="h-5 w-5 text-danger-600 dark:text-danger-400" />
                  <h3 className="font-semibold text-danger-900 dark:text-danger-100">
                    Réinitialiser
                  </h3>
                </div>
                <p className="mb-3 text-sm text-danger-700 dark:text-danger-300">
                  Supprime toute ta progression et recommence à zéro. Cette action est irréversible !
                </p>
                <button
                  onClick={handleReset}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-danger-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-danger-700"
                >
                  <RotateCcw className="h-4 w-4" />
                  Tout réinitialiser
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
