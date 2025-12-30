'use client'

import { useState } from 'react'
import { ChevronDown, ChevronRight, Eye, EyeOff, CheckCircle2, HelpCircle, Lightbulb, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import MathText from './MathText'

interface ExerciseStep {
  id: number
  title: string
  instruction: string
  hint: string
  solution: string
}

interface GuidedExerciseData {
  id: string
  title: string
  subject: string
  chapter: string
  difficulty: string
  estimatedTime: number
  description: string
  question: string
  steps: ExerciseStep[]
  finalAnswer: string
}

interface GuidedExerciseProps {
  exercise: GuidedExerciseData
  onComplete?: () => void
}

export function GuidedExercise({ exercise, onComplete }: GuidedExerciseProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [completedSteps, setCompletedSteps] = useState<number[]>([])
  const [showHints, setShowHints] = useState<number[]>([])
  const [showSolutions, setShowSolutions] = useState<number[]>([])
  const [showFinalAnswer, setShowFinalAnswer] = useState(false)

  const handleShowHint = (stepId: number) => {
    if (!showHints.includes(stepId)) {
      setShowHints([...showHints, stepId])
    }
  }

  const handleShowSolution = (stepId: number) => {
    if (!showSolutions.includes(stepId)) {
      setShowSolutions([...showSolutions, stepId])
    }
  }

  const handleCompleteStep = (stepId: number) => {
    if (!completedSteps.includes(stepId)) {
      setCompletedSteps([...completedSteps, stepId])
    }
    // Move to next step
    if (currentStep < exercise.steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else if (!showFinalAnswer) {
      setShowFinalAnswer(true)
      if (onComplete) onComplete()
    }
  }

  const progress = ((completedSteps.length) / exercise.steps.length) * 100

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <span className={cn(
            'rounded-full px-2.5 py-0.5 text-xs font-medium',
            exercise.subject === 'physique'
              ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300'
              : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
          )}>
            {exercise.subject === 'physique' ? 'Physique' : 'Chimie'}
          </span>
          <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600 dark:bg-slate-700 dark:text-slate-300">
            {exercise.chapter}
          </span>
          <span className={cn(
            'rounded-full px-2.5 py-0.5 text-xs font-medium',
            exercise.difficulty === 'facile' && 'bg-success-100 text-success-700 dark:bg-success-900/30 dark:text-success-300',
            exercise.difficulty === 'moyen' && 'bg-warning-100 text-warning-700 dark:bg-warning-900/30 dark:text-warning-300',
            exercise.difficulty === 'difficile' && 'bg-danger-100 text-danger-700 dark:bg-danger-900/30 dark:text-danger-300'
          )}>
            {exercise.difficulty}
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            ~{exercise.estimatedTime} min
          </span>
        </div>

        <h2 className="mb-3 text-xl font-bold text-slate-900 dark:text-slate-100">{exercise.title}</h2>

        <div className="mb-4 rounded-lg bg-slate-50 p-4 dark:bg-slate-800/50">
          <p className="text-slate-700 dark:text-slate-300">{exercise.description}</p>
          <p className="mt-3 font-medium text-slate-900 dark:text-slate-100">
            <MathText text={exercise.question} />
          </p>
        </div>

        {/* Progress bar */}
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <div className="h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
              <div
                className="h-full rounded-full bg-primary-500 transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
          <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
            {completedSteps.length}/{exercise.steps.length} étapes
          </span>
        </div>
      </div>

      {/* Steps */}
      <div className="space-y-4">
        {exercise.steps.map((step, index) => {
          const isActive = index === currentStep
          const isCompleted = completedSteps.includes(step.id)
          const isLocked = index > currentStep && !isCompleted
          const hasHint = showHints.includes(step.id)
          const hasSolution = showSolutions.includes(step.id)

          return (
            <div
              key={step.id}
              className={cn(
                'rounded-xl border transition-all',
                isActive && 'border-primary-300 bg-primary-50/50 dark:border-primary-700 dark:bg-primary-900/20',
                isCompleted && !isActive && 'border-success-200 bg-success-50/50 dark:border-success-800 dark:bg-success-900/20',
                !isActive && !isCompleted && 'border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800',
                isLocked && 'opacity-50'
              )}
            >
              {/* Step header */}
              <button
                onClick={() => !isLocked && setCurrentStep(index)}
                disabled={isLocked}
                className="flex w-full items-center justify-between p-4"
              >
                <div className="flex items-center gap-3">
                  <div className={cn(
                    'flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold',
                    isCompleted && 'bg-success-500 text-white',
                    isActive && !isCompleted && 'bg-primary-500 text-white',
                    !isActive && !isCompleted && 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300'
                  )}>
                    {isCompleted ? <CheckCircle2 className="h-5 w-5" /> : step.id}
                  </div>
                  <span className={cn(
                    'font-medium',
                    isActive ? 'text-primary-700 dark:text-primary-300' : 'text-slate-700 dark:text-slate-300'
                  )}>
                    {step.title}
                  </span>
                </div>
                {isActive ? (
                  <ChevronDown className="h-5 w-5 text-slate-400" />
                ) : (
                  <ChevronRight className="h-5 w-5 text-slate-400" />
                )}
              </button>

              {/* Step content */}
              {isActive && (
                <div className="border-t border-slate-200 p-4 dark:border-slate-700">
                  <p className="mb-4 text-slate-700 dark:text-slate-300">
                    {step.instruction}
                  </p>

                  {/* Hint button */}
                  {!hasHint && (
                    <button
                      onClick={() => handleShowHint(step.id)}
                      className="mb-4 flex items-center gap-2 rounded-lg bg-amber-50 px-4 py-2 text-sm font-medium text-amber-700 transition-colors hover:bg-amber-100 dark:bg-amber-900/30 dark:text-amber-300 dark:hover:bg-amber-900/50"
                    >
                      <Lightbulb className="h-4 w-4" />
                      Afficher un indice
                    </button>
                  )}

                  {/* Hint content */}
                  {hasHint && (
                    <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-900/20">
                      <div className="flex items-center gap-2 text-amber-700 dark:text-amber-300">
                        <Lightbulb className="h-4 w-4" />
                        <span className="font-medium">Indice</span>
                      </div>
                      <p className="mt-2 text-amber-800 dark:text-amber-200">{step.hint}</p>
                    </div>
                  )}

                  {/* Solution button */}
                  {!hasSolution && (
                    <button
                      onClick={() => handleShowSolution(step.id)}
                      className="mb-4 flex items-center gap-2 rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
                    >
                      <Eye className="h-4 w-4" />
                      Voir la solution de cette étape
                    </button>
                  )}

                  {/* Solution content */}
                  {hasSolution && (
                    <div className="mb-4 rounded-lg border border-primary-200 bg-primary-50 p-4 dark:border-primary-800 dark:bg-primary-900/20">
                      <div className="flex items-center gap-2 text-primary-700 dark:text-primary-300">
                        <CheckCircle2 className="h-4 w-4" />
                        <span className="font-medium">Solution</span>
                      </div>
                      <div className="mt-2 text-slate-700 dark:text-slate-300">
                        <MathText text={step.solution} />
                      </div>
                    </div>
                  )}

                  {/* Complete step button */}
                  <button
                    onClick={() => handleCompleteStep(step.id)}
                    className="flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-700"
                  >
                    {index < exercise.steps.length - 1 ? (
                      <>
                        Étape suivante
                        <ArrowRight className="h-4 w-4" />
                      </>
                    ) : (
                      <>
                        Terminer l'exercice
                        <CheckCircle2 className="h-4 w-4" />
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Final answer */}
      {showFinalAnswer && (
        <div className="rounded-xl border-2 border-success-300 bg-success-50 p-6 dark:border-success-700 dark:bg-success-900/20">
          <div className="mb-3 flex items-center gap-2 text-success-700 dark:text-success-300">
            <CheckCircle2 className="h-6 w-6" />
            <span className="text-lg font-bold">Réponse finale</span>
          </div>
          <div className="text-lg text-slate-800 dark:text-slate-200">
            <MathText text={exercise.finalAnswer} />
          </div>
        </div>
      )}
    </div>
  )
}
