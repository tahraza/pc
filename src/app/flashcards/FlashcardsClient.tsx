'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import {
  Brain,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  ThumbsDown,
  ThumbsUp,
  Zap,
  Star,
  Filter,
  Play,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useStore } from '@/store/useStore'
import type { Flashcard, FlashcardResponse } from '@/types'

// Fisher-Yates shuffle
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

export default function FlashcardsClient() {
  const searchParams = useSearchParams()
  const lessonFilter = searchParams.get('lesson')

  const { flashcardProgress, reviewFlashcard, getFlashcardsDueForReview } = useStore()

  const [flashcards, setFlashcards] = useState<Flashcard[]>([])
  const [loading, setLoading] = useState(true)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [sessionMode, setSessionMode] = useState<'browse' | 'review'>('browse')
  const [reviewQueue, setReviewQueue] = useState<string[]>([])

  // Load flashcards
  useEffect(() => {
    async function loadFlashcards() {
      try {
        const url = lessonFilter
          ? `/api/flashcards?lesson=${lessonFilter}`
          : '/api/flashcards'
        const response = await fetch(url)
        if (response.ok) {
          const data = await response.json()
          setFlashcards(shuffleArray(data))
        }
      } catch (error) {
        console.error('Error loading flashcards:', error)
      } finally {
        setLoading(false)
      }
    }
    loadFlashcards()
  }, [lessonFilter])

  // Get due cards for review
  useEffect(() => {
    if (sessionMode === 'review') {
      const dueCards = getFlashcardsDueForReview()
      const filtered = lessonFilter
        ? dueCards.filter((id) => flashcards.find((f) => f.id === id)?.lessonId === lessonFilter)
        : dueCards
      setReviewQueue(filtered.length > 0 ? filtered : flashcards.map((f) => f.id))
    }
  }, [sessionMode, lessonFilter, flashcards, getFlashcardsDueForReview])

  const currentFlashcard = sessionMode === 'review'
    ? flashcards.find((f) => f.id === reviewQueue[currentIndex])
    : flashcards[currentIndex]

  const totalCards = sessionMode === 'review' ? reviewQueue.length : flashcards.length

  const handleFlip = () => {
    setIsFlipped(!isFlipped)
  }

  const handlePrevious = () => {
    setIsFlipped(false)
    setCurrentIndex(Math.max(0, currentIndex - 1))
  }

  const handleNext = () => {
    setIsFlipped(false)
    setCurrentIndex(Math.min(totalCards - 1, currentIndex + 1))
  }

  const handleResponse = (response: FlashcardResponse) => {
    if (!currentFlashcard) return

    reviewFlashcard(currentFlashcard.id, currentFlashcard.lessonId, response)

    // Move to next card
    if (currentIndex < totalCards - 1) {
      setIsFlipped(false)
      setCurrentIndex(currentIndex + 1)
    } else {
      // End of review session
      setSessionMode('browse')
      setCurrentIndex(0)
    }
  }

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    switch (e.key) {
      case ' ':
      case 'Enter':
        e.preventDefault()
        handleFlip()
        break
      case 'ArrowLeft':
        handlePrevious()
        break
      case 'ArrowRight':
        handleNext()
        break
      case '1':
        if (isFlipped && sessionMode === 'review') handleResponse('again')
        break
      case '2':
        if (isFlipped && sessionMode === 'review') handleResponse('hard')
        break
      case '3':
        if (isFlipped && sessionMode === 'review') handleResponse('good')
        break
      case '4':
        if (isFlipped && sessionMode === 'review') handleResponse('easy')
        break
    }
  }, [isFlipped, sessionMode, currentIndex])

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-600 border-t-transparent mx-auto" />
          <p className="mt-4 text-slate-600">Chargement des flashcards...</p>
        </div>
      </div>
    )
  }

  if (flashcards.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 py-8">
        <div className="mx-auto max-w-2xl px-4 text-center">
          <Brain className="h-16 w-16 text-slate-300 mx-auto" />
          <h1 className="mt-4 text-2xl font-bold text-slate-900">
            Aucune flashcard disponible
          </h1>
          <p className="mt-2 text-slate-600">
            {lessonFilter
              ? 'Cette leçon n\'a pas encore de flashcards.'
              : 'Aucune flashcard n\'a été créée.'}
          </p>
          <Link href="/lecons" className="btn-primary mt-6 inline-block">
            Explorer les leçons
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="mx-auto max-w-2xl px-4">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <Brain className="h-7 w-7 text-purple-600" />
              Flashcards
            </h1>
            <p className="mt-1 text-slate-600">
              {totalCards} carte{totalCards > 1 ? 's' : ''}
              {lessonFilter && ' pour cette leçon'}
            </p>
          </div>

          <div className="flex gap-2">
            {sessionMode === 'browse' ? (
              <button
                onClick={() => {
                  setSessionMode('review')
                  setCurrentIndex(0)
                  setIsFlipped(false)
                }}
                className="btn-primary flex items-center gap-2"
              >
                <Play className="h-4 w-4" />
                Mode révision
              </button>
            ) : (
              <button
                onClick={() => {
                  setSessionMode('browse')
                  setCurrentIndex(0)
                  setIsFlipped(false)
                }}
                className="btn-secondary flex items-center gap-2"
              >
                <Filter className="h-4 w-4" />
                Mode navigation
              </button>
            )}
          </div>
        </div>

        {/* Progress */}
        <div className="mb-6">
          <div className="flex items-center justify-between text-sm text-slate-600 mb-2">
            <span>Carte {currentIndex + 1} / {totalCards}</span>
            {sessionMode === 'review' && (
              <span className="text-purple-600 font-medium">Mode révision</span>
            )}
          </div>
          <div className="progress-bar">
            <div
              className="progress-bar-fill bg-purple-500"
              style={{ width: `${((currentIndex + 1) / totalCards) * 100}%` }}
            />
          </div>
        </div>

        {/* Flashcard */}
        {currentFlashcard && (
          <div
            className={cn('flashcard cursor-pointer', isFlipped && 'flipped')}
            onClick={handleFlip}
            style={{ minHeight: '300px' }}
          >
            <div className="flashcard-inner">
              {/* Front */}
              <div className="flashcard-front card flex flex-col items-center justify-center p-8 text-center">
                <div className="absolute top-4 right-4">
                  <span className={cn(
                    'badge text-xs',
                    currentFlashcard.category === 'formula' && 'bg-primary-100 text-primary-700',
                    currentFlashcard.category === 'definition' && 'bg-amber-100 text-amber-700',
                    currentFlashcard.category === 'method' && 'bg-purple-100 text-purple-700',
                    currentFlashcard.category === 'trap' && 'bg-danger-100 text-danger-700',
                    currentFlashcard.category === 'interpretation' && 'bg-emerald-100 text-emerald-700'
                  )}>
                    {currentFlashcard.category}
                  </span>
                </div>
                <p className="text-lg font-medium text-slate-900">
                  {currentFlashcard.front}
                </p>
                <p className="mt-4 text-sm text-slate-400">
                  Cliquez ou appuyez sur Espace pour retourner
                </p>
              </div>

              {/* Back */}
              <div className="flashcard-back card flex flex-col items-center justify-center p-8 text-center bg-gradient-to-br from-purple-50 to-white">
                <p className="text-lg text-slate-900">
                  {currentFlashcard.back}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation / Response buttons */}
        <div className="mt-6">
          {sessionMode === 'browse' ? (
            <div className="flex items-center justify-between">
              <button
                onClick={handlePrevious}
                disabled={currentIndex === 0}
                className="btn-secondary flex items-center gap-2"
              >
                <ChevronLeft className="h-4 w-4" />
                Précédent
              </button>

              <button
                onClick={handleFlip}
                className="btn-outline flex items-center gap-2"
              >
                <RotateCcw className="h-4 w-4" />
                Retourner
              </button>

              <button
                onClick={handleNext}
                disabled={currentIndex === totalCards - 1}
                className="btn-secondary flex items-center gap-2"
              >
                Suivant
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          ) : isFlipped ? (
            <div className="space-y-4">
              <p className="text-center text-sm text-slate-600">
                Comment as-tu trouvé cette carte ?
              </p>
              <div className="grid grid-cols-4 gap-2">
                <button
                  onClick={() => handleResponse('again')}
                  className="btn flex flex-col items-center gap-1 bg-danger-100 text-danger-700 hover:bg-danger-200 py-3"
                >
                  <ThumbsDown className="h-5 w-5" />
                  <span className="text-xs">À revoir</span>
                  <kbd className="text-xs opacity-50">1</kbd>
                </button>
                <button
                  onClick={() => handleResponse('hard')}
                  className="btn flex flex-col items-center gap-1 bg-warning-100 text-warning-700 hover:bg-warning-200 py-3"
                >
                  <span className="text-lg">😕</span>
                  <span className="text-xs">Difficile</span>
                  <kbd className="text-xs opacity-50">2</kbd>
                </button>
                <button
                  onClick={() => handleResponse('good')}
                  className="btn flex flex-col items-center gap-1 bg-success-100 text-success-700 hover:bg-success-200 py-3"
                >
                  <ThumbsUp className="h-5 w-5" />
                  <span className="text-xs">Bien</span>
                  <kbd className="text-xs opacity-50">3</kbd>
                </button>
                <button
                  onClick={() => handleResponse('easy')}
                  className="btn flex flex-col items-center gap-1 bg-primary-100 text-primary-700 hover:bg-primary-200 py-3"
                >
                  <Star className="h-5 w-5" />
                  <span className="text-xs">Facile</span>
                  <kbd className="text-xs opacity-50">4</kbd>
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center">
              <button
                onClick={handleFlip}
                className="btn-primary flex items-center gap-2 mx-auto"
              >
                <RotateCcw className="h-4 w-4" />
                Voir la réponse
              </button>
            </div>
          )}
        </div>

        {/* Keyboard shortcuts help */}
        <div className="mt-8 text-center text-xs text-slate-400">
          <p>Raccourcis : Espace = retourner, ← → = naviguer</p>
          {sessionMode === 'review' && <p>1-4 = répondre (après avoir retourné)</p>}
        </div>
      </div>
    </div>
  )
}
