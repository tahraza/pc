'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { AlertTriangle, ChevronDown, ChevronUp, CheckCircle, XCircle, Eye, EyeOff, Lightbulb, BookOpen, Shuffle, Filter, RotateCcw } from 'lucide-react'

interface FindErrorExercise {
  id: string
  lessonId: string
  title: string
  difficulty: number
  problem: string
  wrongSolution: {
    steps: string[]
    finalAnswer: string
  }
  error: {
    location: string
    description: string
    type: string
  }
  correctSolution: {
    steps: string[]
    finalAnswer: string
  }
  hint?: string
}

const lessonNames: Record<string, string> = {
  'ondes-mecaniques': 'Ondes mécaniques',
  'diffraction': 'Diffraction',
  'circuit-rc': 'Circuit RC',
  'acides-bases': 'Acides et bases',
  'cinetique': 'Cinétique chimique',
  'energie-mecanique': 'Énergie mécanique',
  'equilibres-chimiques': 'Équilibres chimiques',
  'interferences': 'Interférences',
  'mouvement-newton': 'Lois de Newton',
}

const lessonTracks: Record<string, string> = {
  'ondes-mecaniques': 'physique',
  'diffraction': 'physique',
  'interferences': 'physique',
  'circuit-rc': 'physique',
  'energie-mecanique': 'physique',
  'mouvement-newton': 'physique',
  'cinetique': 'chimie',
  'acides-bases': 'chimie',
  'equilibres-chimiques': 'chimie',
}

const errorTypeLabels: Record<string, { label: string; color: string }> = {
  'formule': { label: 'Erreur de formule', color: 'bg-red-600' },
  'conversion': { label: 'Erreur de conversion', color: 'bg-orange-600' },
  'concept': { label: 'Erreur conceptuelle', color: 'bg-purple-600' },
}

type ExerciseState = 'solving' | 'revealed' | 'correct' | 'incorrect'

export default function TrouverErreurClient() {
  const [exercises, setExercises] = useState<FindErrorExercise[]>([])
  const [loading, setLoading] = useState(true)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [filterLesson, setFilterLesson] = useState<string | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [exerciseState, setExerciseState] = useState<ExerciseState>('solving')
  const [showHint, setShowHint] = useState(false)
  const [selectedStep, setSelectedStep] = useState<number | null>(null)
  const [shuffledExercises, setShuffledExercises] = useState<FindErrorExercise[]>([])

  useEffect(() => {
    fetch('/api/find-error')
      .then(res => res.json())
      .then(data => {
        setExercises(data)
        setShuffledExercises([...data].sort(() => Math.random() - 0.5))
        setLoading(false)
      })
      .catch(err => {
        console.error('Erreur:', err)
        setLoading(false)
      })
  }, [])

  const uniqueLessons = Array.from(new Set(exercises.map(e => e.lessonId)))

  const filteredExercises = filterLesson
    ? shuffledExercises.filter(e => e.lessonId === filterLesson)
    : shuffledExercises

  const currentExercise = filteredExercises[currentIndex]

  const handleStepClick = (stepIndex: number) => {
    if (exerciseState !== 'solving') return
    setSelectedStep(stepIndex)
  }

  const handleVerify = () => {
    if (selectedStep === null) return

    const errorStep = currentExercise.error.location.toLowerCase()
    const selectedStepText = `étape ${selectedStep + 1}`

    if (errorStep.includes(selectedStepText) || errorStep.includes(`${selectedStep + 1}`)) {
      setExerciseState('correct')
    } else {
      setExerciseState('incorrect')
    }
  }

  const handleReveal = () => {
    setExerciseState('revealed')
  }

  const handleNext = () => {
    setCurrentIndex(prev => (prev + 1) % filteredExercises.length)
    setExerciseState('solving')
    setSelectedStep(null)
    setShowHint(false)
  }

  const handleReset = () => {
    setExerciseState('solving')
    setSelectedStep(null)
    setShowHint(false)
  }

  const handleShuffle = () => {
    setShuffledExercises([...exercises].sort(() => Math.random() - 0.5))
    setCurrentIndex(0)
    setExerciseState('solving')
    setSelectedStep(null)
    setShowHint(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="h-10 bg-slate-800 rounded w-1/2 mb-6"></div>
            <div className="h-64 bg-slate-800 rounded-lg"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!currentExercise) {
    return (
      <div className="min-h-screen bg-slate-900 p-6">
        <div className="max-w-4xl mx-auto text-center py-12">
          <AlertTriangle className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400">Aucun exercice disponible pour ce filtre.</p>
          <button
            onClick={() => setFilterLesson(null)}
            className="mt-4 px-4 py-2 bg-red-600 rounded-lg text-white"
          >
            Voir tous les exercices
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-900 to-orange-900 py-8 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <AlertTriangle className="w-8 h-8 text-red-400" />
            <h1 className="text-3xl font-bold text-white">Trouver l'erreur</h1>
          </div>
          <p className="text-red-200">
            Développe ton esprit critique en identifiant les erreurs dans les solutions
          </p>
          <div className="flex gap-4 mt-4">
            <div className="bg-white/10 rounded-lg px-4 py-2">
              <p className="text-sm text-red-300">Exercices</p>
              <p className="text-2xl font-bold text-white">{exercises.length}</p>
            </div>
            <div className="bg-white/10 rounded-lg px-4 py-2">
              <p className="text-sm text-red-300">Progression</p>
              <p className="text-2xl font-bold text-white">{currentIndex + 1}/{filteredExercises.length}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6">
        {/* Controls */}
        <div className="flex flex-wrap gap-4 mb-6">
          <button
            onClick={handleShuffle}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-600 to-orange-600 rounded-lg font-medium hover:from-red-500 hover:to-orange-500 transition-all"
          >
            <Shuffle className="w-4 h-4" />
            Mélanger
          </button>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600"
          >
            <Filter className="w-4 h-4" />
            Filtrer
            <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="mb-6 p-4 bg-slate-800/50 rounded-lg">
            <p className="text-sm text-slate-400 mb-2">Par chapitre:</p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => { setFilterLesson(null); setCurrentIndex(0); }}
                className={`px-3 py-1 rounded-lg text-sm ${
                  filterLesson === null
                    ? 'bg-red-600 text-white'
                    : 'bg-slate-700 text-slate-300'
                }`}
              >
                Tous
              </button>
              {uniqueLessons.map(lessonId => (
                <button
                  key={lessonId}
                  onClick={() => { setFilterLesson(filterLesson === lessonId ? null : lessonId); setCurrentIndex(0); }}
                  className={`px-3 py-1 rounded-lg text-sm ${
                    filterLesson === lessonId
                      ? 'bg-red-600 text-white'
                      : 'bg-slate-700 text-slate-300'
                  }`}
                >
                  {lessonNames[lessonId] || lessonId}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Exercise Card */}
        <div className="bg-slate-800 rounded-xl overflow-hidden border border-slate-700">
          {/* Exercise Header */}
          <div className="p-4 bg-slate-700/50 border-b border-slate-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-semibold text-white">{currentExercise.title}</h2>
                <span className="text-xs px-2 py-0.5 bg-slate-600 rounded text-slate-300">
                  {lessonNames[currentExercise.lessonId] || currentExercise.lessonId}
                </span>
              </div>
              <div className="flex gap-0.5">
                {[1, 2, 3].map(i => (
                  <span
                    key={i}
                    className={`w-2 h-2 rounded-full ${
                      i <= currentExercise.difficulty ? 'bg-amber-500' : 'bg-slate-600'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Problem */}
          <div className="p-4 border-b border-slate-700">
            <h3 className="text-sm font-medium text-slate-400 mb-2">Énoncé</h3>
            <p className="text-white">{currentExercise.problem}</p>
          </div>

          {/* Wrong Solution - Interactive */}
          <div className="p-4 border-b border-slate-700">
            <h3 className="text-sm font-medium text-red-400 mb-3 flex items-center gap-2">
              <XCircle className="w-4 h-4" />
              Solution proposée (contient une erreur)
            </h3>
            <p className="text-xs text-slate-400 mb-3">
              {exerciseState === 'solving' && 'Clique sur l\'étape qui contient l\'erreur'}
            </p>
            <div className="space-y-2">
              {currentExercise.wrongSolution.steps.map((step, idx) => (
                <div
                  key={idx}
                  onClick={() => handleStepClick(idx)}
                  className={`p-3 rounded-lg transition-all ${
                    exerciseState === 'solving'
                      ? selectedStep === idx
                        ? 'bg-red-900/50 border-2 border-red-500 cursor-pointer'
                        : 'bg-slate-700/50 hover:bg-slate-700 cursor-pointer border-2 border-transparent'
                      : exerciseState === 'correct' || exerciseState === 'revealed' || exerciseState === 'incorrect'
                        ? currentExercise.error.location.toLowerCase().includes(`${idx + 1}`)
                          ? 'bg-red-900/50 border-2 border-red-500'
                          : 'bg-slate-700/50 border-2 border-transparent'
                        : 'bg-slate-700/50 border-2 border-transparent'
                  }`}
                >
                  <span className="text-slate-400 text-sm mr-2">Étape {idx + 1}:</span>
                  <span className="text-white">{step}</span>
                </div>
              ))}
              <div className="p-3 bg-slate-700/50 rounded-lg mt-2">
                <span className="text-slate-400 text-sm mr-2">Réponse finale:</span>
                <span className="text-white font-medium">{currentExercise.wrongSolution.finalAnswer}</span>
              </div>
            </div>
          </div>

          {/* Hint */}
          {currentExercise.hint && exerciseState === 'solving' && (
            <div className="p-4 border-b border-slate-700">
              <button
                onClick={() => setShowHint(!showHint)}
                className="flex items-center gap-2 text-amber-400 hover:text-amber-300"
              >
                <Lightbulb className="w-4 h-4" />
                {showHint ? 'Masquer l\'indice' : 'Voir un indice'}
              </button>
              {showHint && (
                <p className="mt-2 p-3 bg-amber-900/30 rounded-lg text-amber-200 text-sm">
                  {currentExercise.hint}
                </p>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="p-4 border-b border-slate-700">
            {exerciseState === 'solving' && (
              <div className="flex gap-3">
                <button
                  onClick={handleVerify}
                  disabled={selectedStep === null}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all ${
                    selectedStep !== null
                      ? 'bg-green-600 hover:bg-green-500 text-white'
                      : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  <CheckCircle className="w-5 h-5" />
                  Vérifier ma réponse
                </button>
                <button
                  onClick={handleReveal}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-slate-700 hover:bg-slate-600 rounded-lg text-slate-300"
                >
                  <Eye className="w-5 h-5" />
                  Voir la solution
                </button>
              </div>
            )}

            {exerciseState === 'correct' && (
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 text-green-400 mb-2">
                  <CheckCircle className="w-6 h-6" />
                  <span className="text-lg font-medium">Bravo ! Tu as trouvé l'erreur !</span>
                </div>
              </div>
            )}

            {exerciseState === 'incorrect' && (
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 text-red-400 mb-2">
                  <XCircle className="w-6 h-6" />
                  <span className="text-lg font-medium">Ce n'est pas la bonne étape...</span>
                </div>
                <button
                  onClick={handleReset}
                  className="mt-2 flex items-center justify-center gap-2 px-4 py-2 mx-auto bg-slate-700 hover:bg-slate-600 rounded-lg text-slate-300"
                >
                  <RotateCcw className="w-4 h-4" />
                  Réessayer
                </button>
              </div>
            )}
          </div>

          {/* Error Explanation (shown after correct/revealed) */}
          {(exerciseState === 'correct' || exerciseState === 'revealed') && (
            <div className="p-4 border-b border-slate-700 bg-slate-700/30">
              <h3 className="text-sm font-medium text-red-400 mb-3 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Explication de l'erreur
              </h3>
              <div className="space-y-2">
                <p className="text-white">
                  <span className="text-slate-400">Localisation:</span> {currentExercise.error.location}
                </p>
                <p className="text-white">
                  <span className="text-slate-400">Type:</span>{' '}
                  <span className={`px-2 py-0.5 rounded text-xs ${errorTypeLabels[currentExercise.error.type]?.color || 'bg-slate-600'} text-white`}>
                    {errorTypeLabels[currentExercise.error.type]?.label || currentExercise.error.type}
                  </span>
                </p>
                <p className="text-white mt-2">{currentExercise.error.description}</p>
              </div>
            </div>
          )}

          {/* Correct Solution (shown after correct/revealed) */}
          {(exerciseState === 'correct' || exerciseState === 'revealed') && (
            <div className="p-4 border-b border-slate-700">
              <h3 className="text-sm font-medium text-green-400 mb-3 flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Solution correcte
              </h3>
              <div className="space-y-2">
                {currentExercise.correctSolution.steps.map((step, idx) => (
                  <div key={idx} className="p-3 bg-green-900/20 rounded-lg border border-green-800/50">
                    <span className="text-green-400 text-sm mr-2">Étape {idx + 1}:</span>
                    <span className="text-white">{step}</span>
                  </div>
                ))}
                <div className="p-3 bg-green-900/30 rounded-lg mt-2">
                  <span className="text-green-400 text-sm mr-2">Réponse correcte:</span>
                  <span className="text-white font-medium">{currentExercise.correctSolution.finalAnswer}</span>
                </div>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="p-4 flex items-center justify-between">
            {lessonTracks[currentExercise.lessonId] && (
              <Link
                href={`/lecons/${lessonTracks[currentExercise.lessonId]}/${currentExercise.lessonId}`}
                className="flex items-center gap-2 text-sm text-red-400 hover:text-red-300"
              >
                <BookOpen className="w-4 h-4" />
                Revoir la leçon
              </Link>
            )}
            <button
              onClick={handleNext}
              className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-red-600 to-orange-600 rounded-lg font-medium hover:from-red-500 hover:to-orange-500 transition-all ml-auto"
            >
              Exercice suivant
              <ChevronDown className="w-4 h-4 rotate-[-90deg]" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
