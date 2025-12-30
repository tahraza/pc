'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Lightbulb,
  Clock,
  Brain,
  ClipboardList,
  Play,
  Pause,
  RotateCcw,
  CheckCircle,
  ArrowRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useStore } from '@/store/useStore'

type SessionType = 'short' | 'long'
type SessionPhase = 'select' | 'running' | 'complete'

const SESSION_DURATIONS: Record<SessionType, number> = {
  short: 10 * 60, // 10 minutes
  long: 25 * 60, // 25 minutes
}

export default function RevisionPage() {
  const {
    getFlashcardsDueForReview,
    startRevisionSession,
    completeRevisionSession,
    recordStudyTime,
  } = useStore()

  const [sessionType, setSessionType] = useState<SessionType>('short')
  const [phase, setPhase] = useState<SessionPhase>('select')
  const [timeRemaining, setTimeRemaining] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [reviewedCards, setReviewedCards] = useState<string[]>([])
  const [completedExercises, setCompletedExercises] = useState<string[]>([])

  // Timer
  useEffect(() => {
    if (phase !== 'running' || isPaused) return

    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          handleSessionComplete()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [phase, isPaused])

  const handleStartSession = (type: SessionType) => {
    setSessionType(type)
    setTimeRemaining(SESSION_DURATIONS[type])
    const id = startRevisionSession(type)
    setSessionId(id)
    setPhase('running')
    setReviewedCards([])
    setCompletedExercises([])
  }

  const handleSessionComplete = () => {
    if (sessionId) {
      const score = reviewedCards.length + completedExercises.length * 5
      completeRevisionSession(sessionId, reviewedCards, completedExercises, score)
      const minutesStudied = Math.ceil((SESSION_DURATIONS[sessionType] - timeRemaining) / 60)
      recordStudyTime(minutesStudied)
    }
    setPhase('complete')
  }

  const handleReset = () => {
    setPhase('select')
    setTimeRemaining(0)
    setSessionId(null)
    setIsPaused(false)
    setReviewedCards([])
    setCompletedExercises([])
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const dueFlashcards = getFlashcardsDueForReview()

  // Session selection
  if (phase === 'select') {
    return (
      <div className="min-h-screen bg-slate-50 py-8">
        <div className="mx-auto max-w-3xl px-4">
          <div className="text-center mb-12">
            <h1 className="text-3xl font-bold text-slate-900 flex items-center justify-center gap-3">
              <Lightbulb className="h-8 w-8 text-amber-500" />
              Session de révision
            </h1>
            <p className="mt-3 text-slate-600">
              Choisis la durée de ta session. Tu réviseras un mix de flashcards et d'exercices.
            </p>
          </div>

          {/* Due cards info */}
          {dueFlashcards.length > 0 && (
            <div className="mb-8 rounded-xl bg-primary-50 border border-primary-200 p-4">
              <div className="flex items-center gap-2 text-primary-700">
                <Brain className="h-5 w-5" />
                <span className="font-medium">{dueFlashcards.length} flashcards à réviser aujourd'hui</span>
              </div>
            </div>
          )}

          {/* Session options */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Short session */}
            <button
              onClick={() => handleStartSession('short')}
              className="card text-left hover:border-primary-300 hover:shadow-lg transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary-100 text-primary-600 group-hover:bg-primary-600 group-hover:text-white transition-colors">
                  <Clock className="h-7 w-7" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Session courte</h2>
                  <p className="text-slate-600">10 minutes</p>
                </div>
              </div>
              <p className="mt-4 text-slate-600">
                Parfait pour une révision rapide entre deux cours ou pendant une pause.
              </p>
              <ul className="mt-4 space-y-2 text-sm text-slate-600">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-success-500" />
                  ~15 flashcards
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-success-500" />
                  1-2 exercices rapides
                </li>
              </ul>
              <div className="mt-6 flex items-center gap-2 text-primary-600 font-medium group-hover:text-primary-700">
                Commencer
                <ArrowRight className="h-4 w-4" />
              </div>
            </button>

            {/* Long session */}
            <button
              onClick={() => handleStartSession('long')}
              className="card text-left hover:border-amber-300 hover:shadow-lg transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-amber-100 text-amber-600 group-hover:bg-amber-600 group-hover:text-white transition-colors">
                  <Clock className="h-7 w-7" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Session longue</h2>
                  <p className="text-slate-600">25 minutes</p>
                </div>
              </div>
              <p className="mt-4 text-slate-600">
                Session complète type Pomodoro pour une révision approfondie.
              </p>
              <ul className="mt-4 space-y-2 text-sm text-slate-600">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-success-500" />
                  ~30 flashcards
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-success-500" />
                  3-4 exercices variés
                </li>
              </ul>
              <div className="mt-6 flex items-center gap-2 text-amber-600 font-medium group-hover:text-amber-700">
                Commencer
                <ArrowRight className="h-4 w-4" />
              </div>
            </button>
          </div>

          {/* Quick links */}
          <div className="mt-12 text-center">
            <p className="text-slate-600 mb-4">Ou accède directement à :</p>
            <div className="flex justify-center gap-4">
              <Link
                href="/flashcards"
                className="btn-outline flex items-center gap-2"
              >
                <Brain className="h-4 w-4" />
                Flashcards
              </Link>
              <Link
                href="/exercices"
                className="btn-outline flex items-center gap-2"
              >
                <ClipboardList className="h-4 w-4" />
                Exercices
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Running session
  if (phase === 'running') {
    const progress = ((SESSION_DURATIONS[sessionType] - timeRemaining) / SESSION_DURATIONS[sessionType]) * 100

    return (
      <div className="min-h-screen bg-slate-50 py-8">
        <div className="mx-auto max-w-3xl px-4">
          {/* Timer */}
          <div className="card text-center mb-8">
            <div className="text-6xl font-bold text-slate-900 mb-4">
              {formatTime(timeRemaining)}
            </div>
            <div className="progress-bar mb-4">
              <div
                className="progress-bar-fill"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setIsPaused(!isPaused)}
                className="btn-secondary flex items-center gap-2"
              >
                {isPaused ? (
                  <>
                    <Play className="h-4 w-4" />
                    Reprendre
                  </>
                ) : (
                  <>
                    <Pause className="h-4 w-4" />
                    Pause
                  </>
                )}
              </button>
              <button
                onClick={handleSessionComplete}
                className="btn-primary flex items-center gap-2"
              >
                <CheckCircle className="h-4 w-4" />
                Terminer
              </button>
            </div>
          </div>

          {/* Session content */}
          <div className="grid gap-6 md:grid-cols-2">
            <Link
              href="/flashcards"
              target="_blank"
              className="card hover:border-purple-300 hover:shadow-md transition-all"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 text-purple-600">
                  <Brain className="h-5 w-5" />
                </div>
                <h3 className="font-semibold text-slate-900">Flashcards</h3>
              </div>
              <p className="text-sm text-slate-600 mb-4">
                Révise tes flashcards en mode révision espacée.
              </p>
              <div className="text-sm text-slate-500">
                {reviewedCards.length} révisées cette session
              </div>
            </Link>

            <Link
              href="/exercices"
              target="_blank"
              className="card hover:border-amber-300 hover:shadow-md transition-all"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 text-amber-600">
                  <ClipboardList className="h-5 w-5" />
                </div>
                <h3 className="font-semibold text-slate-900">Exercices</h3>
              </div>
              <p className="text-sm text-slate-600 mb-4">
                Fais des exercices pour appliquer tes connaissances.
              </p>
              <div className="text-sm text-slate-500">
                {completedExercises.length} terminés cette session
              </div>
            </Link>
          </div>

          {/* Tips */}
          <div className="mt-8 rounded-xl bg-amber-50 border border-amber-200 p-4">
            <h3 className="font-semibold text-amber-900 mb-2">Conseils pour une révision efficace</h3>
            <ul className="space-y-1 text-sm text-amber-800">
              <li>• Alterne entre flashcards et exercices pour varier les activités</li>
              <li>• Ne regarde pas la réponse trop vite : prends le temps de chercher</li>
              <li>• Marque honnêtement ta maîtrise des flashcards</li>
            </ul>
          </div>
        </div>
      </div>
    )
  }

  // Session complete
  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="mx-auto max-w-lg px-4">
        <div className="card text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-success-100 mb-6">
            <CheckCircle className="h-10 w-10 text-success-600" />
          </div>

          <h1 className="text-2xl font-bold text-slate-900 mb-2">
            Session terminée !
          </h1>
          <p className="text-slate-600 mb-6">
            Bravo, tu as révisé pendant {sessionType === 'short' ? '10' : '25'} minutes.
          </p>

          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="rounded-lg bg-purple-50 p-4">
              <div className="text-2xl font-bold text-purple-700">{reviewedCards.length}</div>
              <div className="text-sm text-purple-600">Flashcards</div>
            </div>
            <div className="rounded-lg bg-amber-50 p-4">
              <div className="text-2xl font-bold text-amber-700">{completedExercises.length}</div>
              <div className="text-sm text-amber-600">Exercices</div>
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={handleReset}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              Nouvelle session
            </button>
            <Link
              href="/stats"
              className="btn-secondary w-full inline-block"
            >
              Voir mes statistiques
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
