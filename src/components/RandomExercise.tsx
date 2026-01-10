'use client'

import React, { useState, useEffect } from 'react'
import { RandomExerciseTemplate, GeneratedExercise } from '@/types'
import { generateExercise } from '@/lib/random-exercise-generator'
import { RefreshCw, Eye, EyeOff, Lightbulb, CheckCircle } from 'lucide-react'
import MathText from './MathText'

interface RandomExerciseProps {
  template: RandomExerciseTemplate
  onComplete?: () => void
}

export function RandomExercise({ template, onComplete }: RandomExerciseProps) {
  const [exercise, setExercise] = useState<GeneratedExercise | null>(null)
  const [showHints, setShowHints] = useState(false)
  const [hintsRevealed, setHintsRevealed] = useState(0)
  const [showSolution, setShowSolution] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [isCompleted, setIsCompleted] = useState(false)

  // Générer un exercice au montage
  useEffect(() => {
    setExercise(generateExercise(template))
    resetState()
  }, [template])

  const resetState = () => {
    setShowHints(false)
    setHintsRevealed(0)
    setShowSolution(false)
    setCurrentStep(0)
    setIsCompleted(false)
  }

  const handleRegenerate = () => {
    setExercise(generateExercise(template, Date.now()))
    resetState()
  }

  const handleShowHint = () => {
    if (hintsRevealed < (exercise?.hints.length || 0)) {
      setHintsRevealed(prev => prev + 1)
    }
    setShowHints(true)
  }

  const handleShowSolution = () => {
    setShowSolution(true)
    setCurrentStep(0)
  }

  const handleNextStep = () => {
    if (exercise && currentStep < exercise.solutionSteps.length - 1) {
      setCurrentStep(prev => prev + 1)
    } else {
      setIsCompleted(true)
      onComplete?.()
    }
  }

  const handleComplete = () => {
    setIsCompleted(true)
    onComplete?.()
  }

  if (!exercise) {
    return (
      <div className="animate-pulse bg-slate-800 rounded-xl p-6">
        <div className="h-6 bg-slate-700 rounded w-3/4 mb-4"></div>
        <div className="h-20 bg-slate-700 rounded"></div>
      </div>
    )
  }

  const difficultyColors = {
    1: 'bg-green-600',
    2: 'bg-lime-600',
    3: 'bg-yellow-600',
    4: 'bg-orange-600',
    5: 'bg-red-600'
  }

  return (
    <div className="bg-slate-800 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="bg-slate-700 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className={`px-2 py-1 rounded text-xs font-medium text-white ${difficultyColors[exercise.difficulty]}`}>
            Niveau {exercise.difficulty}
          </span>
          <h3 className="font-semibold text-white">{exercise.title}</h3>
        </div>
        <button
          onClick={handleRegenerate}
          className="flex items-center gap-2 px-3 py-1.5 bg-purple-600 hover:bg-purple-500 rounded-lg text-sm font-medium transition-colors"
          title="Générer un nouvel exercice"
        >
          <RefreshCw className="w-4 h-4" />
          Nouveau
        </button>
      </div>

      {/* Énoncé */}
      <div className="p-4 border-b border-slate-700">
        <h4 className="text-sm font-medium text-slate-400 mb-2">Énoncé</h4>
        <div className="text-white whitespace-pre-line">
          <MathText text={exercise.statement} />
        </div>
      </div>

      {/* Indices */}
      <div className="p-4 border-b border-slate-700">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-medium text-slate-400 flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-yellow-500" />
            Indices ({hintsRevealed}/{exercise.hints.length})
          </h4>
          <button
            onClick={handleShowHint}
            disabled={hintsRevealed >= exercise.hints.length}
            className="text-sm text-yellow-500 hover:text-yellow-400 disabled:text-slate-500 disabled:cursor-not-allowed"
          >
            {hintsRevealed < exercise.hints.length ? 'Voir un indice' : 'Tous révélés'}
          </button>
        </div>
        {showHints && hintsRevealed > 0 && (
          <ul className="space-y-2">
            {exercise.hints.slice(0, hintsRevealed).map((hint, index) => (
              <li key={index} className="flex items-start gap-2 text-sm text-slate-300">
                <span className="text-yellow-500 font-bold">{index + 1}.</span>
                {hint}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Solution */}
      <div className="p-4">
        {!showSolution ? (
          <div className="flex gap-3">
            <button
              onClick={handleShowSolution}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm font-medium transition-colors"
            >
              <Eye className="w-4 h-4" />
              Voir la solution
            </button>
            <button
              onClick={handleComplete}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-500 rounded-lg text-sm font-medium transition-colors"
            >
              <CheckCircle className="w-4 h-4" />
              J'ai réussi !
            </button>
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium text-slate-400">
                Solution - Étape {currentStep + 1}/{exercise.solutionSteps.length}
              </h4>
              <button
                onClick={() => setShowSolution(false)}
                className="text-sm text-slate-400 hover:text-slate-300"
              >
                <EyeOff className="w-4 h-4" />
              </button>
            </div>

            {/* Barre de progression */}
            <div className="flex gap-1 mb-4">
              {exercise.solutionSteps.map((_, index) => (
                <div
                  key={index}
                  className={`h-1 flex-1 rounded ${
                    index <= currentStep ? 'bg-purple-500' : 'bg-slate-600'
                  }`}
                />
              ))}
            </div>

            {/* Étape courante */}
            <div className="bg-slate-700 rounded-lg p-4 mb-4">
              <h5 className="font-medium text-purple-400 mb-2">
                {exercise.solutionSteps[currentStep].title}
              </h5>
              <div className="text-white mb-2">
                <MathText text={exercise.solutionSteps[currentStep].content} />
              </div>
              {exercise.solutionSteps[currentStep].explanation && (
                <p className="text-sm text-slate-400 italic">
                  💡 {exercise.solutionSteps[currentStep].explanation}
                </p>
              )}
            </div>

            {/* Navigation */}
            <div className="flex gap-3">
              <button
                onClick={() => setCurrentStep(prev => Math.max(0, prev - 1))}
                disabled={currentStep === 0}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                ← Précédent
              </button>
              <button
                onClick={handleNextStep}
                className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg text-sm font-medium transition-colors"
              >
                {currentStep < exercise.solutionSteps.length - 1 ? 'Suivant →' : 'Terminer ✓'}
              </button>
            </div>

            {/* Réponse finale */}
            {isCompleted && (
              <div className="mt-4 p-4 bg-green-900/30 border border-green-700 rounded-lg">
                <h5 className="font-medium text-green-400 mb-1">Réponse finale</h5>
                <div className="text-white">
                  <MathText text={exercise.finalAnswer} />
                </div>
                <div className="text-sm text-slate-400 mt-2">
                  <strong>Méthode:</strong> <MathText text={exercise.method} />
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Complétion */}
      {isCompleted && !showSolution && (
        <div className="px-4 pb-4">
          <div className="p-4 bg-green-900/30 border border-green-700 rounded-lg text-center">
            <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
            <p className="text-green-400 font-medium">Bravo ! Exercice complété</p>
            <button
              onClick={handleRegenerate}
              className="mt-3 px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg text-sm font-medium transition-colors"
            >
              Faire un autre exercice du même type
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default RandomExercise
