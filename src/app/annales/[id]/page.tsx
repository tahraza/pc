'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  Award,
  Calendar,
  ChevronDown,
  ChevronRight,
  Clock,
  Eye,
  EyeOff,
  CheckCircle2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import MathText from '@/components/MathText'
import annalesData from '../../../../content/annales.json'

interface Question {
  number: string
  text: string
  points: number
  answer: string
}

interface Part {
  id: string
  title: string
  questions: Question[]
}

interface Annale {
  id: string
  year: number
  session: string
  exerciseNumber: number
  title: string
  subject: string
  themes: string[]
  points: number
  duration: number
  difficulty: string
  description: string
  parts: Part[]
}

export default function AnnalePage() {
  const params = useParams()
  const [mounted, setMounted] = useState(false)
  const [expandedParts, setExpandedParts] = useState<string[]>([])
  const [shownAnswers, setShownAnswers] = useState<string[]>([])

  useEffect(() => {
    setMounted(true)
  }, [])

  const annaleId = params.id as string
  const annale = annalesData.annales.find((a) => a.id === annaleId) as Annale | undefined

  const togglePart = (partId: string) => {
    setExpandedParts(prev =>
      prev.includes(partId)
        ? prev.filter(p => p !== partId)
        : [...prev, partId]
    )
  }

  const toggleAnswer = (questionId: string) => {
    setShownAnswers(prev =>
      prev.includes(questionId)
        ? prev.filter(q => q !== questionId)
        : [...prev, questionId]
    )
  }

  const showAllAnswers = () => {
    const allQuestionIds = annale?.parts.flatMap(p =>
      p.questions.map(q => `${p.id}-${q.number}`)
    ) || []
    setShownAnswers(allQuestionIds)
    setExpandedParts(annale?.parts.map(p => p.id) || [])
  }

  const hideAllAnswers = () => {
    setShownAnswers([])
  }

  if (!mounted) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-600 border-t-transparent" />
      </div>
    )
  }

  if (!annale) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-8">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-xl border border-slate-200 bg-white p-12 text-center dark:border-slate-700 dark:bg-slate-800">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
              Annale non trouvée
            </h2>
            <p className="mt-2 text-slate-600 dark:text-slate-400">
              L'annale demandée n'existe pas.
            </p>
            <Link
              href="/annales"
              className="mt-4 inline-flex items-center gap-2 text-amber-600 hover:text-amber-700 dark:text-amber-400"
            >
              <ArrowLeft className="h-4 w-4" />
              Retour aux annales
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-8">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Navigation */}
        <div className="mb-6">
          <Link
            href="/annales"
            className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour aux annales
          </Link>
        </div>

        {/* Header */}
        <div className="mb-8 rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <span className="flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 text-sm font-semibold text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
              <Calendar className="h-4 w-4" />
              Bac {annale.year}
            </span>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-600 dark:bg-slate-700 dark:text-slate-300">
              {annale.session}
            </span>
            <span className={cn(
              'rounded-full px-3 py-1 text-sm font-medium',
              annale.subject === 'physique'
                ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300'
                : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
            )}>
              {annale.subject === 'physique' ? 'Physique' : 'Chimie'}
            </span>
          </div>

          <h1 className="mb-2 text-2xl font-bold text-slate-900 dark:text-slate-100">
            Exercice {annale.exerciseNumber} : {annale.title}
          </h1>

          <p className="mb-4 text-slate-600 dark:text-slate-400">
            {annale.description}
          </p>

          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
              <Award className="h-4 w-4" />
              {annale.points} points
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
              <Clock className="h-4 w-4" />
              ~{annale.duration} minutes
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-1">
            {annale.themes.map(theme => (
              <span
                key={theme}
                className="rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-600 dark:bg-slate-700 dark:text-slate-400"
              >
                {theme}
              </span>
            ))}
          </div>
        </div>

        {/* Show/Hide all answers */}
        <div className="mb-6 flex gap-2">
          <button
            onClick={showAllAnswers}
            className="flex items-center gap-2 rounded-lg bg-primary-100 px-4 py-2 text-sm font-medium text-primary-700 transition-colors hover:bg-primary-200 dark:bg-primary-900/30 dark:text-primary-300 dark:hover:bg-primary-900/50"
          >
            <Eye className="h-4 w-4" />
            Voir toutes les réponses
          </button>
          <button
            onClick={hideAllAnswers}
            className="flex items-center gap-2 rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
          >
            <EyeOff className="h-4 w-4" />
            Cacher les réponses
          </button>
        </div>

        {/* Parts and questions */}
        <div className="space-y-4">
          {annale.parts.map((part) => {
            const isExpanded = expandedParts.includes(part.id)

            return (
              <div
                key={part.id}
                className="rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800"
              >
                {/* Part header */}
                <button
                  onClick={() => togglePart(part.id)}
                  className="flex w-full items-center justify-between p-5"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100 text-sm font-bold text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
                      {part.id}
                    </span>
                    <span className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                      {part.title}
                    </span>
                  </div>
                  {isExpanded ? (
                    <ChevronDown className="h-5 w-5 text-slate-400" />
                  ) : (
                    <ChevronRight className="h-5 w-5 text-slate-400" />
                  )}
                </button>

                {/* Questions */}
                {isExpanded && (
                  <div className="border-t border-slate-200 p-5 dark:border-slate-700">
                    <div className="space-y-6">
                      {part.questions.map((question) => {
                        const questionId = `${part.id}-${question.number}`
                        const isAnswerShown = shownAnswers.includes(questionId)

                        return (
                          <div key={question.number} className="space-y-3">
                            {/* Question */}
                            <div className="flex gap-3">
                              <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                                {question.number}
                              </span>
                              <div className="flex-1">
                                <div className="flex items-start justify-between gap-2">
                                  <p className="text-slate-700 dark:text-slate-300">
                                    <MathText text={question.text} />
                                  </p>
                                  <span className="flex-shrink-0 rounded bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600 dark:bg-slate-700 dark:text-slate-400">
                                    {question.points} pt{question.points > 1 ? 's' : ''}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Answer toggle */}
                            {!isAnswerShown ? (
                              <button
                                onClick={() => toggleAnswer(questionId)}
                                className="ml-9 flex items-center gap-2 rounded-lg bg-primary-50 px-3 py-2 text-sm font-medium text-primary-700 transition-colors hover:bg-primary-100 dark:bg-primary-900/20 dark:text-primary-300 dark:hover:bg-primary-900/30"
                              >
                                <Eye className="h-4 w-4" />
                                Voir la réponse
                              </button>
                            ) : (
                              <div className="ml-9 rounded-lg border border-success-200 bg-success-50 p-4 dark:border-success-800 dark:bg-success-900/20">
                                <div className="mb-2 flex items-center gap-2 text-success-700 dark:text-success-300">
                                  <CheckCircle2 className="h-4 w-4" />
                                  <span className="font-medium">Correction</span>
                                  <button
                                    onClick={() => toggleAnswer(questionId)}
                                    className="ml-auto text-xs text-success-600 hover:text-success-700 dark:text-success-400"
                                  >
                                    Cacher
                                  </button>
                                </div>
                                <div className="text-sm text-slate-700 dark:text-slate-300">
                                  <MathText text={question.answer} />
                                </div>
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Navigation to other annales */}
        <div className="mt-8 rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
          <h3 className="mb-4 font-semibold text-slate-900 dark:text-slate-100">
            Autres annales de {annale.year}
          </h3>
          <div className="space-y-2">
            {annalesData.annales
              .filter((a) => a.year === annale.year && a.id !== annale.id)
              .slice(0, 3)
              .map((a) => (
                <Link
                  key={a.id}
                  href={`/annales/${a.id}`}
                  className="flex items-center justify-between rounded-lg bg-slate-50 p-3 transition-colors hover:bg-slate-100 dark:bg-slate-800/50 dark:hover:bg-slate-700/50"
                >
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Ex. {a.exerciseNumber} : {a.title}
                  </span>
                  <span className={cn(
                    'text-xs',
                    a.subject === 'physique' ? 'text-primary-600 dark:text-primary-400' : 'text-emerald-600 dark:text-emerald-400'
                  )}>
                    {a.subject === 'physique' ? 'Physique' : 'Chimie'}
                  </span>
                </Link>
              ))}
          </div>
          <Link
            href="/annales"
            className="mt-4 block text-center text-sm font-medium text-amber-600 hover:text-amber-700 dark:text-amber-400"
          >
            Voir toutes les annales
          </Link>
        </div>
      </div>
    </div>
  )
}
