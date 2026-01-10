'use client'

import { useState, useEffect, useCallback } from 'react'
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
  Timer,
  Zap,
  Skull,
  Star,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useStore } from '@/store/useStore'
import { useGamificationStore } from '@/stores/gamificationStore'
import { useChallengesStore } from '@/stores/challengesStore'
import MathText from '@/components/MathText'
import type { Quiz, QuizQuestion, QuizAttempt, PreQuizDiagnostic } from '@/types'

// Types pour les modes de difficulté
type DifficultyMode = 'normal' | 'difficile' | 'expert' | 'hardcore'

interface DifficultyConfig {
  name: string
  description: string
  icon: React.ReactNode
  timePerQuestion: number | null // null = pas de limite
  pointsMultiplier: number
  showExplanations: boolean
  shuffleQuestions: boolean
  oneChanceOnly: boolean // Mode hardcore
  color: string
}

const DIFFICULTY_MODES: Record<DifficultyMode, DifficultyConfig> = {
  normal: {
    name: 'Normal',
    description: 'Mode standard, pas de limite de temps',
    icon: <Star className="h-5 w-5" />,
    timePerQuestion: null,
    pointsMultiplier: 1,
    showExplanations: true,
    shuffleQuestions: false,
    oneChanceOnly: false,
    color: 'text-primary-600 bg-primary-100 border-primary-300',
  },
  difficile: {
    name: 'Difficile',
    description: '30s par question, pas d\'explications',
    icon: <Timer className="h-5 w-5" />,
    timePerQuestion: 30,
    pointsMultiplier: 1.5,
    showExplanations: false,
    shuffleQuestions: false,
    oneChanceOnly: false,
    color: 'text-warning-600 bg-warning-100 border-warning-300',
  },
  expert: {
    name: 'Expert',
    description: '20s par question, questions mélangées',
    icon: <Zap className="h-5 w-5" />,
    timePerQuestion: 20,
    pointsMultiplier: 2,
    showExplanations: false,
    shuffleQuestions: true,
    oneChanceOnly: false,
    color: 'text-orange-600 bg-orange-100 border-orange-300',
  },
  hardcore: {
    name: 'Hardcore',
    description: '15s par question, 1 erreur = échec',
    icon: <Skull className="h-5 w-5" />,
    timePerQuestion: 15,
    pointsMultiplier: 3,
    showExplanations: false,
    shuffleQuestions: true,
    oneChanceOnly: true,
    color: 'text-danger-600 bg-danger-100 border-danger-300',
  },
}

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
  const { recordQuizCompleted } = useGamificationStore()
  const { updateChallengeProgress } = useChallengesStore()

  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<string, number | number[]>>({})
  const [showResults, setShowResults] = useState(false)
  const [showExplanation, setShowExplanation] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [shuffledOptions, setShuffledOptions] = useState<ShuffledOptions>({})

  // Mode de difficulté
  const [difficultyMode, setDifficultyMode] = useState<DifficultyMode>('normal')
  const [hasStarted, setHasStarted] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null)
  const [hardcoreFailed, setHardcoreFailed] = useState(false)
  const [shuffledQuestions, setShuffledQuestions] = useState<QuizQuestion[]>([])

  const config = DIFFICULTY_MODES[difficultyMode]

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

  // Timer effect
  useEffect(() => {
    if (!hasStarted || !config.timePerQuestion || showResults || hardcoreFailed) {
      return
    }

    setTimeRemaining(config.timePerQuestion)

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev === null || prev <= 1) {
          // Temps écoulé - passer à la question suivante ou terminer
          if (currentQuestion < (shuffledQuestions.length || quiz?.questions.length || 0) - 1) {
            setCurrentQuestion((c) => c + 1)
            setIsSubmitted(false)
            setShowExplanation(false)
            return config.timePerQuestion
          } else {
            // Fin du quiz
            clearInterval(timer)
            return 0
          }
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [hasStarted, currentQuestion, config.timePerQuestion, showResults, hardcoreFailed, shuffledQuestions.length, quiz?.questions.length])

  // Fonction pour démarrer le quiz
  const handleStartQuiz = () => {
    if (!quiz) return

    // Mélanger les questions si mode expert ou hardcore
    if (config.shuffleQuestions) {
      const shuffled = [...quiz.questions].sort(() => Math.random() - 0.5)
      setShuffledQuestions(shuffled)
    } else {
      setShuffledQuestions(quiz.questions)
    }

    setHasStarted(true)
    if (config.timePerQuestion) {
      setTimeRemaining(config.timePerQuestion)
    }
  }

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

  // Écran de sélection du mode (avant de commencer)
  if (!hasStarted) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-8">
        <div className="mx-auto max-w-2xl px-4">
          <Link
            href="/lecons"
            className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 hover:text-primary-600 mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour
          </Link>

          <div className="card">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
              {quiz.title}
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              {quiz.questions.length} questions • {quiz.description}
            </p>

            <h2 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">
              Choisissez votre mode de difficulté
            </h2>

            <div className="grid gap-3">
              {(Object.entries(DIFFICULTY_MODES) as [DifficultyMode, DifficultyConfig][]).map(([mode, modeConfig]) => (
                <button
                  key={mode}
                  onClick={() => setDifficultyMode(mode)}
                  className={cn(
                    'flex items-center gap-4 rounded-lg border-2 p-4 text-left transition-all',
                    difficultyMode === mode
                      ? modeConfig.color + ' border-current'
                      : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                  )}
                >
                  <div className={cn(
                    'flex h-10 w-10 items-center justify-center rounded-full',
                    difficultyMode === mode ? 'bg-white/50' : 'bg-slate-100 dark:bg-slate-800'
                  )}>
                    {modeConfig.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{modeConfig.name}</span>
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700">
                        x{modeConfig.pointsMultiplier}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {modeConfig.description}
                    </p>
                  </div>
                </button>
              ))}
            </div>

            <button
              onClick={handleStartQuiz}
              className="mt-6 w-full btn-primary py-3 text-lg font-semibold"
            >
              Commencer le QCM
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Écran d'échec hardcore
  if (hardcoreFailed) {
    const answeredCount = Object.keys(answers).length
    const correctCount = Object.entries(answers).filter(([qId, answer]) => {
      const q = quiz.questions.find(q => q.id === qId)
      return q && isAnswerCorrect(q, answer)
    }).length

    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-8">
        <div className="mx-auto max-w-2xl px-4">
          <div className="card text-center">
            <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-danger-100 dark:bg-danger-900/30">
              <Skull className="h-12 w-12 text-danger-600 dark:text-danger-400" />
            </div>

            <h1 className="mt-6 text-2xl font-bold text-slate-900 dark:text-slate-100">
              Mode Hardcore - Échec
            </h1>

            <p className="mt-4 text-lg text-slate-600 dark:text-slate-400">
              Une seule erreur en mode hardcore signifie la fin du quiz.
            </p>

            <div className="mt-6 rounded-lg bg-slate-100 dark:bg-slate-800 p-4">
              <p className="text-slate-900 dark:text-slate-100">
                <span className="font-semibold">{correctCount}</span> bonnes réponses sur{' '}
                <span className="font-semibold">{answeredCount}</span> questions tentées
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                Aucun point attribué en cas d'échec hardcore
              </p>
            </div>

            <div className="mt-8 flex flex-col gap-3">
              <button
                onClick={() => {
                  setHardcoreFailed(false)
                  setHasStarted(false)
                  setAnswers({})
                  setCurrentQuestion(0)
                  setIsSubmitted(false)
                  setShowExplanation(false)
                  setDifficultyMode('normal')
                }}
                className="btn-primary"
              >
                Réessayer (mode différent)
              </button>
              <Link href="/lecons" className="btn-secondary">
                Retour aux leçons
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Utiliser les questions mélangées si disponibles
  const questions = shuffledQuestions.length > 0 ? shuffledQuestions : quiz.questions
  const question = questions[currentQuestion]
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

    // Afficher l'explication seulement si le mode le permet
    if (config.showExplanations) {
      setShowExplanation(true)
    }

    // Mode hardcore : vérifier si la réponse est correcte
    if (config.oneChanceOnly) {
      const userAnswer = answers[question.id]
      if (userAnswer === undefined || !isAnswerCorrect(question, userAnswer)) {
        setHardcoreFailed(true)
        return
      }
    }
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

    // Attribuer les points de gamification avec multiplicateur
    const basePoints = correctCount * 10
    const bonusPoints = Math.round(basePoints * (config.pointsMultiplier - 1))
    recordQuizCompleted(quiz.id, correctCount, totalQuestions, bonusPoints)

    // Mettre à jour les défis
    updateChallengeProgress('quizzes', 1)
    if (score === 100) {
      updateChallengeProgress('perfect_quiz', 1)
    }

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
    const basePoints = correctCount * 10
    const bonusPoints = Math.round(basePoints * (config.pointsMultiplier - 1))

    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-8">
        <div className="mx-auto max-w-2xl px-4">
          <div className="card text-center">
            {/* Difficulty mode badge */}
            {difficultyMode !== 'normal' && (
              <div className="mb-4">
                <span className={cn(
                  'inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm font-medium',
                  config.color
                )}>
                  {config.icon}
                  Mode {config.name}
                </span>
              </div>
            )}

            {/* Score display */}
            <div className={cn(
              'mx-auto flex h-24 w-24 items-center justify-center rounded-full',
              passed ? 'bg-success-100 dark:bg-success-900/30' : 'bg-warning-100 dark:bg-warning-900/30'
            )}>
              {passed ? (
                <Trophy className="h-12 w-12 text-success-600 dark:text-success-400" />
              ) : (
                <Target className="h-12 w-12 text-warning-600 dark:text-warning-400" />
              )}
            </div>

            <h1 className="mt-6 text-2xl font-bold text-slate-900 dark:text-slate-100">
              {quiz.type === 'pre' ? 'Résultat du diagnostic' : 'Résultat du QCM'}
            </h1>

            <div className="mt-4 text-5xl font-bold text-slate-900 dark:text-slate-100">
              {score}%
            </div>
            <p className="mt-2 text-slate-600 dark:text-slate-400">
              {correctCount} / {totalQuestions} bonnes réponses
            </p>

            {/* Points earned with bonus */}
            {bonusPoints > 0 && (
              <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-primary-100 dark:bg-primary-900/30 px-4 py-2 text-primary-700 dark:text-primary-300">
                <Zap className="h-5 w-5" />
                <span className="font-semibold">+{bonusPoints} points bonus</span>
                <span className="text-sm">(x{config.pointsMultiplier})</span>
              </div>
            )}

            {/* Pre-quiz diagnostic */}
            {diagnostic && (
              <div className={cn(
                'mt-6 rounded-lg p-4 text-left',
                diagnostic.level === 'low' && 'bg-danger-50 dark:bg-danger-900/20',
                diagnostic.level === 'medium' && 'bg-warning-50 dark:bg-warning-900/20',
                diagnostic.level === 'high' && 'bg-success-50 dark:bg-success-900/20'
              )}>
                <h2 className="font-semibold text-slate-900 dark:text-slate-100">
                  {diagnostic.level === 'low' && 'Prérequis à revoir'}
                  {diagnostic.level === 'medium' && 'Quelques points à consolider'}
                  {diagnostic.level === 'high' && 'Excellentes bases !'}
                </h2>
                <ul className="mt-2 space-y-1 text-sm text-slate-700 dark:text-slate-300">
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
                passed ? 'bg-success-50 dark:bg-success-900/20' : 'bg-warning-50 dark:bg-warning-900/20'
              )}>
                <p className="font-medium text-slate-900 dark:text-slate-100">
                  {passed
                    ? 'Bravo ! Tu maîtrises les notions de cette leçon.'
                    : 'Continue à travailler cette leçon pour mieux la maîtriser.'}
                </p>
              </div>
            )}

            {/* Action buttons */}
            <div className="mt-8 flex flex-col gap-3">
              <Link
                href={`/lecons/${quiz.track || 'physique'}/${quiz.lessonId}`}
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
            <h2 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">Récapitulatif des réponses</h2>
            <div className="space-y-4">
              {quiz.questions.map((q, index) => {
                const userAnswer = answers[q.id]
                const correct = isAnswerCorrect(q, userAnswer)

                return (
                  <div
                    key={q.id}
                    className={cn(
                      'rounded-lg border p-3',
                      correct
                        ? 'border-success-200 bg-success-50 dark:border-success-800 dark:bg-success-900/20'
                        : 'border-danger-200 bg-danger-50 dark:border-danger-800 dark:bg-danger-900/20'
                    )}
                  >
                    <div className="flex items-start gap-2">
                      {correct ? (
                        <CheckCircle className="h-5 w-5 text-success-600 dark:text-success-400 flex-shrink-0 mt-0.5" />
                      ) : (
                        <XCircle className="h-5 w-5 text-danger-600 dark:text-danger-400 flex-shrink-0 mt-0.5" />
                      )}
                      <div>
                        <p className="font-medium text-sm text-slate-900 dark:text-slate-100">Question {index + 1}</p>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1"><MathText text={q.explanation || ''} /></p>
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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-8">
      <div className="mx-auto max-w-2xl px-4">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className={cn(
                'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium',
                config.color
              )}>
                {config.icon}
                {config.name}
              </span>
              <span className="text-sm text-slate-600 dark:text-slate-400">
                {quiz.type === 'pre' ? 'Diagnostic' : 'Validation'}
              </span>
            </div>
            <div className="flex items-center gap-3">
              {/* Timer */}
              {timeRemaining !== null && (
                <div className={cn(
                  'flex items-center gap-1 rounded-full px-3 py-1 text-sm font-bold',
                  timeRemaining <= 5
                    ? 'bg-danger-100 text-danger-700 dark:bg-danger-900/30 dark:text-danger-400 animate-pulse'
                    : timeRemaining <= 10
                    ? 'bg-warning-100 text-warning-700 dark:bg-warning-900/30 dark:text-warning-400'
                    : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                )}>
                  <Timer className="h-4 w-4" />
                  {timeRemaining}s
                </div>
              )}
              <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                {currentQuestion + 1} / {totalQuestions}
              </span>
            </div>
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
          <h2 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-6">
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
              isAnswerCorrect(question, userAnswer!)
                ? 'bg-success-50 dark:bg-success-900/20'
                : 'bg-danger-50 dark:bg-danger-900/20'
            )}>
              <div className="flex items-start gap-2">
                {isAnswerCorrect(question, userAnswer!) ? (
                  <CheckCircle className="h-5 w-5 text-success-600 dark:text-success-400 flex-shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="h-5 w-5 text-danger-600 dark:text-danger-400 flex-shrink-0 mt-0.5" />
                )}
                <div>
                  <p className="font-medium text-slate-900 dark:text-slate-100">
                    {isAnswerCorrect(question, userAnswer!) ? 'Correct !' : 'Incorrect'}
                  </p>
                  <p className="mt-1 text-sm text-slate-700 dark:text-slate-300"><MathText text={question.explanation || ''} /></p>
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
