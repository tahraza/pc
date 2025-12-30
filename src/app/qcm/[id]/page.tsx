'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Trophy,
  Target,
  BookOpen,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useStore } from '@/store/useStore'
import MathText from '@/components/MathText'
import type { Quiz, QuizQuestion, QuizAttempt, PreQuizDiagnostic } from '@/types'

// Fisher-Yates shuffle that returns shuffled array with original indices
function shuffleWithIndices<T>(array: T[]): { item: T; originalIndex: number }[] {
  const indexed = array.map((item, originalIndex) => ({ item, originalIndex }))
  for (let i = indexed.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[indexed[i], indexed[j]] = [indexed[j], indexed[i]]
  }
  return indexed
}

interface ShuffledOptions {
  [questionId: string]: { item: string; originalIndex: number }[]
}

interface PageProps {
  params: { id: string }
}

export default function QCMPage({ params }: PageProps) {
  const router = useRouter()
  const { addQuizAttempt, updateLessonProgress } = useStore()

  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<string, number | number[]>>({})
  const [showResults, setShowResults] = useState(false)
  const [showExplanation, setShowExplanation] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [shuffledOptions, setShuffledOptions] = useState<ShuffledOptions>({})

  // Load quiz data
  useEffect(() => {
    async function loadQuiz() {
      try {
        const response = await fetch(`/api/quiz/${params.id}`)
        if (response.ok) {
          const data = await response.json()
          setQuiz(data)

          // Shuffle options for each question
          const shuffled: ShuffledOptions = {}
          data.questions.forEach((q: QuizQuestion) => {
            const options = (q as any).options || q.choices || []
            shuffled[q.id] = shuffleWithIndices(options)
          })
          setShuffledOptions(shuffled)
        }
      } catch (error) {
        console.error('Error loading quiz:', error)
      } finally {
        setLoading(false)
      }
    }
    loadQuiz()
  }, [params.id])

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-600 border-t-transparent mx-auto" />
          <p className="mt-4 text-slate-600">Chargement du QCM...</p>
        </div>
      </div>
    )
  }

  if (!quiz) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-warning-500 mx-auto" />
          <h1 className="mt-4 text-xl font-semibold text-slate-900">QCM introuvable</h1>
          <Link href="/lecons" className="mt-4 btn-primary inline-block">
            Retour aux leçons
          </Link>
        </div>
      </div>
    )
  }

  const question = quiz.questions[currentQuestion]
  const totalQuestions = quiz.questions.length
  const progress = ((currentQuestion + 1) / totalQuestions) * 100

  const handleSelectAnswer = (choiceIndex: number) => {
    if (isSubmitted) return

    if (question.multiSelect) {
      const currentAnswers = (answers[question.id] as number[]) || []
      const newAnswers = currentAnswers.includes(choiceIndex)
        ? currentAnswers.filter((i) => i !== choiceIndex)
        : [...currentAnswers, choiceIndex]
      setAnswers({ ...answers, [question.id]: newAnswers })
    } else {
      setAnswers({ ...answers, [question.id]: choiceIndex })
    }
  }

  const handleSubmitQuestion = () => {
    setIsSubmitted(true)
    setShowExplanation(true)
  }

  const handleNextQuestion = () => {
    if (currentQuestion < totalQuestions - 1) {
      setCurrentQuestion(currentQuestion + 1)
      setIsSubmitted(false)
      setShowExplanation(false)
    } else {
      calculateResults()
    }
  }

  const isAnswerCorrect = (question: QuizQuestion, userAnswer: number | number[]): boolean => {
    const correctAnswer = (question as any).correctAnswer ?? question.correct
    if (question.multiSelect) {
      const correct = correctAnswer as number[]
      const user = userAnswer as number[]
      return correct.length === user.length && correct.every((c) => user.includes(c))
    }
    return userAnswer === correctAnswer
  }

  const calculateResults = () => {
    let correctCount = 0
    quiz.questions.forEach((q) => {
      const userAnswer = answers[q.id]
      if (userAnswer !== undefined && isAnswerCorrect(q, userAnswer)) {
        correctCount++
      }
    })

    const score = Math.round((correctCount / totalQuestions) * 100)

    // Generate recommendations for pre-quiz
    let recommendations: string[] = []
    if (quiz.type === 'pre') {
      const missedPrereqs = new Set<string>()
      quiz.questions.forEach((q) => {
        const userAnswer = answers[q.id]
        if (userAnswer === undefined || !isAnswerCorrect(q, userAnswer)) {
          if (q.prereqRef) {
            missedPrereqs.add(q.prereqRef)
          }
        }
      })
      recommendations = Array.from(missedPrereqs)
    }

    // Save attempt
    const attempt: QuizAttempt = {
      quizId: quiz.id,
      lessonId: quiz.lessonId,
      type: quiz.type,
      startedAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
      answers,
      score,
      totalQuestions,
      recommendations,
    }
    addQuizAttempt(attempt)

    // Update lesson progress
    if (quiz.type === 'pre') {
      updateLessonProgress(quiz.lessonId, { preQuizScore: score })
    } else {
      updateLessonProgress(quiz.lessonId, { postQuizScore: score })
    }

    setShowResults(true)
  }

  const getDiagnostic = (): PreQuizDiagnostic => {
    let correctCount = 0
    const missedPrereqs = new Set<string>()

    quiz.questions.forEach((q) => {
      const userAnswer = answers[q.id]
      if (userAnswer !== undefined && isAnswerCorrect(q, userAnswer)) {
        correctCount++
      } else if (q.prereqRef) {
        missedPrereqs.add(q.prereqRef)
      }
    })

    const score = Math.round((correctCount / totalQuestions) * 100)
    let level: 'low' | 'medium' | 'high'
    let recommendations: string[] = []

    if (score < 40) {
      level = 'low'
      recommendations = [
        'Revois les prérequis avant de commencer cette leçon',
        ...Array.from(missedPrereqs),
      ]
    } else if (score < 70) {
      level = 'medium'
      recommendations = [
        'Quelques bases à consolider, mais tu peux commencer',
        ...Array.from(missedPrereqs),
      ]
    } else {
      level = 'high'
      recommendations = ['Excellentes bases ! Tu peux passer en mode accéléré.']
    }

    return {
      score,
      level,
      missingPrereqs: Array.from(missedPrereqs),
      recommendations,
    }
  }

  // Results view
  if (showResults) {
    const diagnostic = quiz.type === 'pre' ? getDiagnostic() : null
    let correctCount = 0
    quiz.questions.forEach((q) => {
      const userAnswer = answers[q.id]
      if (userAnswer !== undefined && isAnswerCorrect(q, userAnswer)) {
        correctCount++
      }
    })
    const score = Math.round((correctCount / totalQuestions) * 100)
    const passed = score >= quiz.passingScore

    return (
      <div className="min-h-screen bg-slate-50 py-8">
        <div className="mx-auto max-w-2xl px-4">
          <div className="card text-center">
            {/* Score display */}
            <div className={cn(
              'mx-auto flex h-24 w-24 items-center justify-center rounded-full',
              passed ? 'bg-success-100' : 'bg-warning-100'
            )}>
              {passed ? (
                <Trophy className="h-12 w-12 text-success-600" />
              ) : (
                <Target className="h-12 w-12 text-warning-600" />
              )}
            </div>

            <h1 className="mt-6 text-2xl font-bold text-slate-900">
              {quiz.type === 'pre' ? 'Résultat du diagnostic' : 'Résultat du QCM'}
            </h1>

            <div className="mt-4 text-5xl font-bold text-slate-900">
              {score}%
            </div>
            <p className="mt-2 text-slate-600">
              {correctCount} / {totalQuestions} bonnes réponses
            </p>

            {/* Pre-quiz diagnostic */}
            {diagnostic && (
              <div className={cn(
                'mt-6 rounded-lg p-4 text-left',
                diagnostic.level === 'low' && 'bg-danger-50',
                diagnostic.level === 'medium' && 'bg-warning-50',
                diagnostic.level === 'high' && 'bg-success-50'
              )}>
                <h2 className="font-semibold">
                  {diagnostic.level === 'low' && 'Prérequis à revoir'}
                  {diagnostic.level === 'medium' && 'Quelques points à consolider'}
                  {diagnostic.level === 'high' && 'Excellentes bases !'}
                </h2>
                <ul className="mt-2 space-y-1 text-sm">
                  {diagnostic.recommendations.map((rec, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="mt-1">•</span>
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Post-quiz result */}
            {quiz.type === 'post' && (
              <div className={cn(
                'mt-6 rounded-lg p-4',
                passed ? 'bg-success-50' : 'bg-warning-50'
              )}>
                <p className="font-medium">
                  {passed
                    ? 'Bravo ! Tu maîtrises les notions de cette leçon.'
                    : 'Continue à travailler cette leçon pour mieux la maîtriser.'}
                </p>
              </div>
            )}

            {/* Action buttons */}
            <div className="mt-8 flex flex-col gap-3">
              <Link
                href={`/lecons?id=${quiz.lessonId}`}
                className="btn-primary flex items-center justify-center gap-2"
              >
                <BookOpen className="h-5 w-5" />
                {quiz.type === 'pre' ? 'Commencer la leçon' : 'Revoir la leçon'}
              </Link>
              <Link
                href="/lecons"
                className="btn-secondary"
              >
                Retour aux leçons
              </Link>
            </div>
          </div>

          {/* Review answers */}
          <div className="mt-8 card">
            <h2 className="font-semibold text-slate-900 mb-4">Récapitulatif des réponses</h2>
            <div className="space-y-4">
              {quiz.questions.map((q, index) => {
                const userAnswer = answers[q.id]
                const correct = isAnswerCorrect(q, userAnswer)

                return (
                  <div
                    key={q.id}
                    className={cn(
                      'rounded-lg border p-3',
                      correct ? 'border-success-200 bg-success-50' : 'border-danger-200 bg-danger-50'
                    )}
                  >
                    <div className="flex items-start gap-2">
                      {correct ? (
                        <CheckCircle className="h-5 w-5 text-success-600 flex-shrink-0 mt-0.5" />
                      ) : (
                        <XCircle className="h-5 w-5 text-danger-600 flex-shrink-0 mt-0.5" />
                      )}
                      <div>
                        <p className="font-medium text-sm">Question {index + 1}</p>
                        <p className="text-sm text-slate-600 mt-1"><MathText text={q.explanation || ''} /></p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Question view
  const userAnswer = answers[question.id]
  const hasAnswered = userAnswer !== undefined

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="mx-auto max-w-2xl px-4">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-600">
              {quiz.type === 'pre' ? 'QCM de diagnostic' : 'QCM de validation'}
            </span>
            <span className="text-sm font-medium text-slate-900">
              Question {currentQuestion + 1} / {totalQuestions}
            </span>
          </div>
          <div className="progress-bar">
            <div
              className="progress-bar-fill"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Question card */}
        <div className="card">
          <h2 className="text-lg font-medium text-slate-900 mb-6">
            <MathText text={question.question} />
          </h2>

          {/* Choices */}
          <div className="space-y-3">
            {(shuffledOptions[question.id] || []).map((shuffledChoice, displayIndex) => {
              const originalIndex = shuffledChoice.originalIndex
              const choice = shuffledChoice.item

              const isSelected = question.multiSelect
                ? (userAnswer as number[] || []).includes(originalIndex)
                : userAnswer === originalIndex

              const correctAnswer = (question as any).correctAnswer ?? question.correct
              const isCorrect = question.multiSelect
                ? (correctAnswer as number[]).includes(originalIndex)
                : correctAnswer === originalIndex

              return (
                <button
                  key={displayIndex}
                  onClick={() => handleSelectAnswer(originalIndex)}
                  disabled={isSubmitted}
                  className={cn(
                    'qcm-choice w-full text-left',
                    isSelected && !isSubmitted && 'selected',
                    isSubmitted && isCorrect && 'correct',
                    isSubmitted && isSelected && !isCorrect && 'incorrect'
                  )}
                >
                  <div className={cn(
                    'flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border-2 text-sm font-medium',
                    isSelected
                      ? 'border-primary-500 bg-primary-500 text-white'
                      : 'border-slate-300'
                  )}>
                    {String.fromCharCode(65 + displayIndex)}
                  </div>
                  <span className="flex-1"><MathText text={choice} /></span>
                  {isSubmitted && isCorrect && (
                    <CheckCircle className="h-5 w-5 text-success-600" />
                  )}
                  {isSubmitted && isSelected && !isCorrect && (
                    <XCircle className="h-5 w-5 text-danger-600" />
                  )}
                </button>
              )
            })}
          </div>

          {/* Explanation */}
          {showExplanation && (
            <div className={cn(
              'mt-6 rounded-lg p-4',
              isAnswerCorrect(question, userAnswer!) ? 'bg-success-50' : 'bg-danger-50'
            )}>
              <div className="flex items-start gap-2">
                {isAnswerCorrect(question, userAnswer!) ? (
                  <CheckCircle className="h-5 w-5 text-success-600 flex-shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="h-5 w-5 text-danger-600 flex-shrink-0 mt-0.5" />
                )}
                <div>
                  <p className="font-medium">
                    {isAnswerCorrect(question, userAnswer!) ? 'Correct !' : 'Incorrect'}
                  </p>
                  <p className="mt-1 text-sm"><MathText text={question.explanation || ''} /></p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="mt-6 flex justify-between">
            <button
              onClick={() => {
                setCurrentQuestion(Math.max(0, currentQuestion - 1))
                setIsSubmitted(false)
                setShowExplanation(false)
              }}
              disabled={currentQuestion === 0}
              className="btn-secondary flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Précédent
            </button>

            {!isSubmitted ? (
              <button
                onClick={handleSubmitQuestion}
                disabled={!hasAnswered}
                className="btn-primary"
              >
                Valider
              </button>
            ) : (
              <button
                onClick={handleNextQuestion}
                className="btn-primary flex items-center gap-2"
              >
                {currentQuestion < totalQuestions - 1 ? 'Suivant' : 'Voir les résultats'}
                <ArrowRight className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
