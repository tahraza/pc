'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  Lightbulb,
  Eye,
  EyeOff,
  CheckCircle,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  BookOpen,
} from 'lucide-react'
import { cn, getDifficultyLabel, getDifficultyColor } from '@/lib/utils'
import { useStore } from '@/store/useStore'
import { LessonContent } from '@/components/LessonContent'
import MathText from '@/components/MathText'
import type { Exercise, SolutionStep } from '@/types'

interface PageProps {
  params: { id: string }
}

export default function ExercisePage({ params }: PageProps) {
  const { exerciseProgress, useExerciseHint, viewExerciseSolution, markExerciseCompleted } = useStore()

  const [exercise, setExercise] = useState<Exercise | null>(null)
  const [loading, setLoading] = useState(true)
  const [hintsRevealed, setHintsRevealed] = useState<number[]>([])
  const [solutionRevealed, setSolutionRevealed] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)

  const progress = exerciseProgress[params.id]

  // Load exercise
  useEffect(() => {
    async function loadExercise() {
      try {
        const response = await fetch(`/api/exercises/${params.id}`)
        if (response.ok) {
          const data = await response.json()
          setExercise(data)
        }
      } catch (error) {
        console.error('Error loading exercise:', error)
      } finally {
        setLoading(false)
      }
    }
    loadExercise()
  }, [params.id])

  const handleRevealHint = (index: number) => {
    if (!hintsRevealed.includes(index)) {
      setHintsRevealed([...hintsRevealed, index])
      useExerciseHint(params.id)
    }
  }

  const handleRevealSolution = () => {
    setSolutionRevealed(true)
    viewExerciseSolution(params.id)
  }

  const handleMarkCompleted = () => {
    if (exercise) {
      markExerciseCompleted(params.id, exercise.lessonId)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-600 border-t-transparent mx-auto" />
          <p className="mt-4 text-slate-600">Chargement de l'exercice...</p>
        </div>
      </div>
    )
  }

  if (!exercise) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-warning-500 mx-auto" />
          <h1 className="mt-4 text-xl font-semibold text-slate-900">Exercice introuvable</h1>
          <Link href="/exercices" className="btn-primary mt-4 inline-block">
            Retour aux exercices
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="mx-auto max-w-3xl px-4">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/exercices"
            className="flex items-center gap-2 text-sm text-slate-600 hover:text-primary-600 mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour aux exercices
          </Link>

          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className={`badge ${getDifficultyColor(exercise.difficulty)}`}>
                  {getDifficultyLabel(exercise.difficulty)}
                </span>
                {exercise.isComprehension && (
                  <span className="badge bg-cyan-100 text-cyan-700">
                    Compréhension
                  </span>
                )}
              </div>
              <h1 className="text-2xl font-bold text-slate-900">{exercise.title}</h1>
            </div>

            {progress?.status === 'completed' ? (
              <span className="badge badge-success flex items-center gap-1">
                <CheckCircle className="h-4 w-4" />
                Terminé
              </span>
            ) : (
              <button
                onClick={handleMarkCompleted}
                className="btn-success text-sm"
              >
                Marquer comme fait
              </button>
            )}
          </div>
        </div>

        {/* Statement */}
        <div className="card mb-6">
          <h2 className="font-semibold text-slate-900 mb-4">Énoncé</h2>
          <div className="lesson-content">
            <LessonContent content={exercise.statement} />
          </div>
        </div>

        {/* Hints */}
        {exercise.hints.length > 0 && (
          <div className="card mb-6">
            <h2 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-amber-500" />
              Indices ({exercise.hints.length})
            </h2>
            <div className="space-y-3">
              {exercise.hints.map((hint, index) => {
                const isRevealed = hintsRevealed.includes(index)

                return (
                  <div key={index} className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-amber-900">
                        Indice {index + 1}
                      </span>
                      {!isRevealed ? (
                        <button
                          onClick={() => handleRevealHint(index)}
                          className="flex items-center gap-1 text-sm text-amber-700 hover:text-amber-900"
                        >
                          <Eye className="h-4 w-4" />
                          Révéler
                        </button>
                      ) : (
                        <EyeOff className="h-4 w-4 text-amber-400" />
                      )}
                    </div>
                    {isRevealed && (
                      <div className="mt-2 text-amber-800">
                        <MathText text={hint} />
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Solution */}
        <div className="card mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-900 flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-success-500" />
              Solution détaillée
            </h2>
            {!solutionRevealed && (
              <button
                onClick={handleRevealSolution}
                className="btn-primary text-sm flex items-center gap-2"
              >
                <Eye className="h-4 w-4" />
                Voir la solution
              </button>
            )}
          </div>

          {solutionRevealed ? (
            <div className="space-y-4">
              {exercise.solutionSteps.map((step, index) => (
                <div
                  key={index}
                  className={cn(
                    'rounded-lg border p-4',
                    index === currentStep
                      ? 'border-primary-300 bg-primary-50'
                      : 'border-slate-200 bg-white'
                  )}
                >
                  <button
                    onClick={() => setCurrentStep(currentStep === index ? -1 : index)}
                    className="flex w-full items-center justify-between"
                  >
                    <span className="font-medium text-slate-900">
                      Étape {step.step} : {step.title}
                    </span>
                    {currentStep === index ? (
                      <ChevronUp className="h-5 w-5 text-slate-400" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-slate-400" />
                    )}
                  </button>

                  {currentStep === index && (
                    <div className="mt-4">
                      <div className="lesson-content">
                        <LessonContent content={step.content} />
                      </div>
                      {step.explanation && (
                        <div className="mt-3 rounded-lg bg-slate-100 p-3 text-sm text-slate-700">
                          <strong>Explication :</strong> <MathText text={step.explanation} />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}

              {/* Method to remember */}
              {exercise.method && (
                <div className="rounded-lg border-l-4 border-purple-500 bg-purple-50 p-4">
                  <h3 className="font-semibold text-purple-900 mb-2">
                    Méthode à retenir
                  </h3>
                  <div className="text-purple-800">
                    <MathText text={exercise.method} />
                  </div>
                </div>
              )}

              {/* Common mistakes */}
              {exercise.commonMistakes.length > 0 && (
                <div className="rounded-lg border-l-4 border-danger-500 bg-danger-50 p-4">
                  <h3 className="font-semibold text-danger-900 mb-2 flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5" />
                    Erreurs fréquentes
                  </h3>
                  <ul className="space-y-1 text-danger-800">
                    {exercise.commonMistakes.map((mistake, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="mt-1">•</span>
                        <MathText text={mistake} />
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <p className="text-slate-500">
              Essaie de résoudre l'exercice par toi-même avant de regarder la solution.
              Tu peux utiliser les indices si tu as besoin d'aide.
            </p>
          )}
        </div>

        {/* Link to related lesson */}
        <div className="text-center">
          <Link
            href={`/lecons?id=${exercise.lessonId}`}
            className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700"
          >
            <BookOpen className="h-4 w-4" />
            Voir la leçon associée
          </Link>
        </div>
      </div>
    </div>
  )
}
