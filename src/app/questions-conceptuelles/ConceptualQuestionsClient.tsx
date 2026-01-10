'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { HelpCircle, ChevronDown, ChevronUp, Lightbulb, CheckCircle, Filter, BookOpen, Shuffle } from 'lucide-react'

interface ConceptualQuestion {
  id: string
  lessonId: string
  question: string
  type: 'pourquoi' | 'que-se-passe-t-il' | 'vrai-faux-explique'
  answer: string
  keyPoints: string[]
  difficulty: number
}

const lessonNames: Record<string, string> = {
  'ondes-mecaniques': 'Ondes mécaniques',
  'ondes-lumineuses': 'Ondes lumineuses',
  'ondes-sonores': 'Ondes sonores',
  'diffraction': 'Diffraction',
  'interferences': 'Interférences',
  'circuit-rc': 'Circuit RC',
  'radioactivite': 'Radioactivité',
  'cinetique': 'Cinétique chimique',
  'acides-bases': 'Acides et bases',
  'equilibres-chimiques': 'Équilibres chimiques',
  'energie-mecanique': 'Énergie mécanique',
  'mouvement-newton': 'Lois de Newton',
  'thermochimie': 'Thermochimie',
  'oxydoreduction': 'Oxydoréduction',
}

const lessonTracks: Record<string, string> = {
  'ondes-mecaniques': 'physique',
  'ondes-lumineuses': 'physique',
  'diffraction': 'physique',
  'interferences': 'physique',
  'circuit-rc': 'physique',
  'radioactivite': 'physique',
  'energie-mecanique': 'physique',
  'mouvement-newton': 'physique',
  'cinetique': 'chimie',
  'acides-bases': 'chimie',
  'equilibres-chimiques': 'chimie',
  'thermochimie': 'chimie',
  'oxydoreduction': 'chimie',
}

const typeLabels: Record<string, { label: string; color: string; icon: string }> = {
  'pourquoi': { label: 'Pourquoi ?', color: 'bg-blue-600', icon: '🤔' },
  'que-se-passe-t-il': { label: 'Que se passe-t-il si...', color: 'bg-purple-600', icon: '🔮' },
  'vrai-faux-explique': { label: 'Vrai ou Faux ?', color: 'bg-amber-600', icon: '⚖️' },
}

export default function ConceptualQuestionsClient() {
  const [questions, setQuestions] = useState<ConceptualQuestion[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [filterLesson, setFilterLesson] = useState<string | null>(null)
  const [filterType, setFilterType] = useState<string | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [randomMode, setRandomMode] = useState(false)
  const [currentRandomIndex, setCurrentRandomIndex] = useState(0)
  const [shuffledQuestions, setShuffledQuestions] = useState<ConceptualQuestion[]>([])

  useEffect(() => {
    fetch('/api/conceptual-questions')
      .then(res => res.json())
      .then(data => {
        setQuestions(data)
        setShuffledQuestions([...data].sort(() => Math.random() - 0.5))
        setLoading(false)
      })
      .catch(err => {
        console.error('Erreur:', err)
        setLoading(false)
      })
  }, [])

  const uniqueLessons = Array.from(new Set(questions.map(q => q.lessonId)))
  const uniqueTypes = Array.from(new Set(questions.map(q => q.type)))

  const filteredQuestions = questions.filter(q => {
    if (filterLesson && q.lessonId !== filterLesson) return false
    if (filterType && q.type !== filterType) return false
    return true
  })

  const displayedRandomQuestions = shuffledQuestions.filter(q => {
    if (filterLesson && q.lessonId !== filterLesson) return false
    if (filterType && q.type !== filterType) return false
    return true
  })

  const handleNextRandom = () => {
    setExpandedId(null)
    setCurrentRandomIndex(prev => (prev + 1) % displayedRandomQuestions.length)
  }

  const handleShuffle = () => {
    setShuffledQuestions([...questions].sort(() => Math.random() - 0.5))
    setCurrentRandomIndex(0)
    setExpandedId(null)
  }

  const currentQuestion = randomMode ? displayedRandomQuestions[currentRandomIndex] : null

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded w-1/2 mb-6"></div>
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-32 bg-slate-200 dark:bg-slate-800 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-900 dark:to-purple-900 py-8 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <HelpCircle className="w-8 h-8 text-indigo-200 dark:text-indigo-400" />
            <h1 className="text-3xl font-bold text-white">Questions Conceptuelles</h1>
          </div>
          <p className="text-indigo-100 dark:text-indigo-200">
            Comprendre le "pourquoi" et pas seulement le "comment calculer"
          </p>
          <div className="flex gap-4 mt-4">
            <div className="bg-white/10 rounded-lg px-4 py-2">
              <p className="text-sm text-indigo-200 dark:text-indigo-300">Questions</p>
              <p className="text-2xl font-bold text-white">{questions.length}</p>
            </div>
            <div className="bg-white/10 rounded-lg px-4 py-2">
              <p className="text-sm text-indigo-200 dark:text-indigo-300">Chapitres</p>
              <p className="text-2xl font-bold text-white">{uniqueLessons.length}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6">
        {/* Mode toggle */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setRandomMode(false)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              !randomMode
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600'
            }`}
          >
            <Filter className="w-4 h-4" />
            Liste complète
          </button>
          <button
            onClick={() => {
              setRandomMode(true)
              setCurrentRandomIndex(0)
              setExpandedId(null)
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              randomMode
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600'
            }`}
          >
            <Shuffle className="w-4 h-4" />
            Mode aléatoire
          </button>
        </div>

        {/* Filters */}
        {!randomMode && (
          <div className="mb-6">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white mb-3"
            >
              <Filter className="w-4 h-4" />
              Filtres
              <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>

            {showFilters && (
              <div className="space-y-3 bg-slate-100 dark:bg-slate-800/50 rounded-lg p-4">
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">Par chapitre:</p>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setFilterLesson(null)}
                      className={`px-3 py-1 rounded-lg text-sm ${
                        filterLesson === null
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      Tous
                    </button>
                    {uniqueLessons.map(lessonId => (
                      <button
                        key={lessonId}
                        onClick={() => setFilterLesson(filterLesson === lessonId ? null : lessonId)}
                        className={`px-3 py-1 rounded-lg text-sm ${
                          filterLesson === lessonId
                            ? 'bg-indigo-600 text-white'
                            : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                        }`}
                      >
                        {lessonNames[lessonId] || lessonId}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">Par type:</p>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setFilterType(null)}
                      className={`px-3 py-1 rounded-lg text-sm ${
                        filterType === null
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      Tous
                    </button>
                    {uniqueTypes.map(type => (
                      <button
                        key={type}
                        onClick={() => setFilterType(filterType === type ? null : type)}
                        className={`px-3 py-1 rounded-lg text-sm ${
                          filterType === type
                            ? typeLabels[type]?.color + ' text-white'
                            : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                        }`}
                      >
                        {typeLabels[type]?.icon} {typeLabels[type]?.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Random mode */}
        {randomMode && currentQuestion && (
          <div className="mb-8">
            <QuestionCard
              question={currentQuestion}
              expanded={expandedId === currentQuestion.id}
              onToggle={() => setExpandedId(expandedId === currentQuestion.id ? null : currentQuestion.id)}
            />
            <div className="flex justify-center gap-3 mt-4">
              <button
                onClick={handleShuffle}
                className="flex items-center gap-2 px-4 py-3 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 rounded-xl font-medium text-slate-700 dark:text-slate-200 transition-all"
              >
                <Shuffle className="w-5 h-5" />
                Mélanger
              </button>
              <button
                onClick={handleNextRandom}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-medium hover:from-purple-500 hover:to-pink-500 transition-all"
              >
                Question suivante
              </button>
            </div>
            <p className="text-center text-slate-500 dark:text-slate-400 text-sm mt-2">
              Question {currentRandomIndex + 1} / {displayedRandomQuestions.length}
            </p>
          </div>
        )}

        {/* List mode */}
        {!randomMode && (
          <div className="space-y-4">
            {filteredQuestions.length === 0 ? (
              <p className="text-slate-500 dark:text-slate-400 text-center py-8">
                Aucune question ne correspond aux filtres sélectionnés.
              </p>
            ) : (
              filteredQuestions.map(question => (
                <QuestionCard
                  key={question.id}
                  question={question}
                  expanded={expandedId === question.id}
                  onToggle={() => setExpandedId(expandedId === question.id ? null : question.id)}
                />
              ))
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function QuestionCard({
  question,
  expanded,
  onToggle
}: {
  question: ConceptualQuestion
  expanded: boolean
  onToggle: () => void
}) {
  const typeInfo = typeLabels[question.type]

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-sm">
      <div
        onClick={onToggle}
        className="p-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
      >
        <div className="flex items-start gap-3">
          <span className="text-2xl">{typeInfo?.icon}</span>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className={`px-2 py-0.5 rounded text-xs font-medium ${typeInfo?.color} text-white`}>
                {typeInfo?.label}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {lessonNames[question.lessonId] || question.lessonId}
              </span>
              <div className="flex gap-0.5 ml-auto">
                {[1, 2, 3].map(i => (
                  <span
                    key={i}
                    className={`w-2 h-2 rounded-full ${
                      i <= question.difficulty ? 'bg-amber-500' : 'bg-slate-300 dark:bg-slate-600'
                    }`}
                  />
                ))}
              </div>
            </div>
            <h3 className="text-slate-900 dark:text-white font-medium">{question.question}</h3>
          </div>
          {expanded ? (
            <ChevronUp className="w-5 h-5 text-slate-400 dark:text-slate-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-slate-400 dark:text-slate-400" />
          )}
        </div>
      </div>

      {expanded && (
        <div className="px-4 pb-4 border-t border-slate-200 dark:border-slate-700">
          <div className="mt-4 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
            <div className="flex items-center gap-2 text-green-600 dark:text-green-400 mb-2">
              <CheckCircle className="w-4 h-4" />
              <span className="font-medium text-sm">Réponse</span>
            </div>
            <p className="text-slate-700 dark:text-slate-200">{question.answer}</p>
          </div>

          <div className="mt-4">
            <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 mb-2">
              <Lightbulb className="w-4 h-4" />
              <span className="font-medium text-sm">Points clés à retenir</span>
            </div>
            <ul className="space-y-1">
              {question.keyPoints.map((point, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300">
                  <span className="text-amber-500 mt-1">•</span>
                  {point}
                </li>
              ))}
            </ul>
          </div>

          {lessonTracks[question.lessonId] && (
            <Link
              href={`/lecons/${lessonTracks[question.lessonId]}/${question.lessonId}`}
              className="mt-4 inline-flex items-center gap-2 text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300"
            >
              <BookOpen className="w-4 h-4" />
              Revoir la leçon
            </Link>
          )}
        </div>
      )}
    </div>
  )
}
