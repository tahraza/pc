'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { RandomExerciseTemplate } from '@/types'
import { RandomExercise } from '@/components/RandomExercise'
import { Shuffle, Filter, ChevronDown, Zap, ArrowLeft, Layers } from 'lucide-react'

// Mapping des lessonId vers des noms lisibles
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
  'titrages': 'Titrages',
  'thermochimie': 'Thermochimie',
  'energie-mecanique': 'Énergie mécanique',
  'mouvement-circulaire': 'Mouvement circulaire',
  'mouvement-newton': 'Lois de Newton',
  'mouvement-champ-uniforme': 'Champ uniforme',
  'electromagnetisme': 'Électromagnétisme',
  'thermodynamique': 'Thermodynamique',
  'travail-force': 'Travail et puissance',
  'oxydoreduction': 'Oxydoréduction',
  'piles-electrolyse': 'Piles et électrolyse',
  'spectroscopie-ir': 'Spectroscopie IR',
  'equilibres-chimiques': 'Équilibres chimiques',
}

const trackColors: Record<string, string> = {
  'ondes-mecaniques': 'bg-blue-600',
  'ondes-lumineuses': 'bg-cyan-600',
  'diffraction': 'bg-purple-600',
  'interferences': 'bg-violet-600',
  'circuit-rc': 'bg-yellow-600',
  'radioactivite': 'bg-orange-600',
  'cinetique': 'bg-green-600',
  'acides-bases': 'bg-red-600',
  'titrages': 'bg-pink-600',
  'thermochimie': 'bg-amber-600',
  'energie-mecanique': 'bg-emerald-600',
  'mouvement-circulaire': 'bg-indigo-600',
  'equilibres-chimiques': 'bg-teal-600',
}

// Mapping lessonId vers track (physique ou chimie)
const lessonTracks: Record<string, string> = {
  'ondes-mecaniques': 'physique',
  'ondes-lumineuses': 'physique',
  'ondes-sonores': 'physique',
  'diffraction': 'physique',
  'interferences': 'physique',
  'circuit-rc': 'physique',
  'radioactivite': 'physique',
  'energie-mecanique': 'physique',
  'mouvement-circulaire': 'physique',
  'mouvement-newton': 'physique',
  'mouvement-champ-uniforme': 'physique',
  'electromagnetisme': 'physique',
  'thermodynamique': 'physique',
  'travail-force': 'physique',
  'cinetique': 'chimie',
  'acides-bases': 'chimie',
  'titrages': 'chimie',
  'thermochimie': 'chimie',
  'oxydoreduction': 'chimie',
  'piles-electrolyse': 'chimie',
  'spectroscopie-ir': 'chimie',
  'equilibres-chimiques': 'chimie',
}

interface Props {
  initialLesson: string | null
}

export default function ExercicesAleatoiresClient({ initialLesson }: Props) {
  const [templates, setTemplates] = useState<RandomExerciseTemplate[]>([])
  // selectedLesson: undefined = utiliser initialLesson, null = tous, string = filtre actif
  const [selectedLesson, setSelectedLesson] = useState<string | null | undefined>(undefined)
  const [selectedTemplate, setSelectedTemplate] = useState<RandomExerciseTemplate | null>(null)
  const [loading, setLoading] = useState(true)
  const [showFilters, setShowFilters] = useState(!!initialLesson)
  const [completedCount, setCompletedCount] = useState(0)

  // Mode interleaving (mélange multi-chapitres)
  const [interleavingMode, setInterleavingMode] = useState(false)
  const [selectedLessons, setSelectedLessons] = useState<string[]>([])

  // Le filtre actif : soit le state (si modifié par l'utilisateur), soit initialLesson
  const activeFilter = selectedLesson === undefined ? initialLesson : selectedLesson

  // Charger les templates
  useEffect(() => {
    fetch('/api/random-exercises')
      .then(res => res.json())
      .then(data => {
        setTemplates(data)
        setLoading(false)
      })
      .catch(err => {
        console.error('Erreur de chargement:', err)
        setLoading(false)
      })
  }, [])

  // Obtenir les leçons uniques
  const uniqueLessons = Array.from(new Set(templates.map(t => t.lessonId)))

  // Filtrer les templates par leçon(s)
  const filteredTemplates = interleavingMode
    ? (selectedLessons.length > 0
        ? templates.filter(t => selectedLessons.includes(t.lessonId))
        : templates)
    : (activeFilter
        ? templates.filter(t => t.lessonId === activeFilter)
        : templates)

  // Toggle une leçon dans la sélection multiple
  const toggleLesson = (lessonId: string) => {
    setSelectedLessons(prev =>
      prev.includes(lessonId)
        ? prev.filter(l => l !== lessonId)
        : [...prev, lessonId]
    )
  }

  // Sélectionner un exercice aléatoire
  const handleRandomExercise = () => {
    if (filteredTemplates.length > 0) {
      const randomIndex = Math.floor(Math.random() * filteredTemplates.length)
      setSelectedTemplate(filteredTemplates[randomIndex])
    }
  }

  const handleComplete = () => {
    setCompletedCount(prev => prev + 1)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded w-1/2 mb-6"></div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-20 bg-slate-200 dark:bg-slate-800 rounded-lg"></div>
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
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 dark:from-purple-900 dark:to-indigo-900 py-8 px-6">
        <div className="max-w-4xl mx-auto">
          {/* Lien retour à la leçon */}
          {activeFilter && lessonTracks[activeFilter] && (
            <Link
              href={`/lecons/${lessonTracks[activeFilter]}/${activeFilter}`}
              className="inline-flex items-center gap-2 text-purple-200 dark:text-purple-300 hover:text-white mb-4 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Retour à la leçon {lessonNames[activeFilter] || activeFilter}
            </Link>
          )}
          <div className="flex items-center gap-3 mb-2">
            <Shuffle className="w-8 h-8 text-purple-200 dark:text-purple-400" />
            <h1 className="text-3xl font-bold text-white">Exercices Aléatoires</h1>
          </div>
          <p className="text-purple-100 dark:text-purple-200">
            Entraînement infini avec des valeurs qui changent à chaque fois
          </p>

          {/* Stats */}
          <div className="flex gap-6 mt-4">
            <div className="bg-white/10 rounded-lg px-4 py-2">
              <p className="text-sm text-purple-200 dark:text-purple-300">Templates disponibles</p>
              <p className="text-2xl font-bold text-white">{templates.length}</p>
            </div>
            <div className="bg-white/10 rounded-lg px-4 py-2">
              <p className="text-sm text-purple-200 dark:text-purple-300">Chapitres</p>
              <p className="text-2xl font-bold text-white">{uniqueLessons.length}</p>
            </div>
            <div className="bg-white/10 rounded-lg px-4 py-2">
              <p className="text-sm text-purple-200 dark:text-purple-300">Complétés (session)</p>
              <p className="text-2xl font-bold text-white">{completedCount}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6">
        {/* Mode interleaving toggle */}
        <div className="mb-6">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => {
                setInterleavingMode(false)
                setSelectedLessons([])
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                !interleavingMode
                  ? 'bg-purple-600 text-white'
                  : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600'
              }`}
            >
              <Filter className="w-4 h-4" />
              Mode classique
            </button>
            <button
              onClick={() => {
                setInterleavingMode(true)
                setShowFilters(true)
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                interleavingMode
                  ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white'
                  : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600'
              }`}
            >
              <Layers className="w-4 h-4" />
              Mode interleaving
              <span className="text-xs opacity-75">(mélange)</span>
            </button>
          </div>

          {interleavingMode && (
            <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-700/50 rounded-lg p-4 mb-4">
              <p className="text-sm text-orange-700 dark:text-orange-200 mb-3">
                <strong>Interleaving :</strong> Sélectionne plusieurs chapitres pour mélanger les exercices.
                Plus efficace pour la mémorisation à long terme !
              </p>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedLessons([])}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    selectedLessons.length === 0
                      ? 'bg-orange-600 text-white'
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600'
                  }`}
                >
                  Tous les chapitres
                </button>
                {uniqueLessons.map(lessonId => (
                  <button
                    key={lessonId}
                    onClick={() => toggleLesson(lessonId)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      selectedLessons.includes(lessonId)
                        ? `${trackColors[lessonId] || 'bg-orange-600'} text-white ring-2 ring-white/30`
                        : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600'
                    }`}
                  >
                    {lessonNames[lessonId] || lessonId}
                  </button>
                ))}
              </div>
              {selectedLessons.length > 1 && (
                <p className="text-xs text-orange-600 dark:text-orange-300 mt-2">
                  {selectedLessons.length} chapitres sélectionnés • {filteredTemplates.length} exercices disponibles
                </p>
              )}
            </div>
          )}

          {!interleavingMode && (
            <>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white mb-3"
              >
                <Filter className="w-4 h-4" />
                Filtrer par chapitre
                <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
              </button>

              {showFilters && (
                <div className="flex flex-wrap gap-2 mb-4">
                  <button
                    onClick={() => setSelectedLesson(null)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      activeFilter === null
                        ? 'bg-purple-600 text-white'
                        : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600'
                    }`}
                  >
                    Tous
                  </button>
                  {uniqueLessons.map(lessonId => (
                    <button
                      key={lessonId}
                      onClick={() => setSelectedLesson(lessonId)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                        activeFilter === lessonId
                          ? `${trackColors[lessonId] || 'bg-purple-600'} text-white`
                          : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600'
                      }`}
                    >
                      {lessonNames[lessonId] || lessonId}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* Bouton exercice aléatoire */}
        <div className="flex justify-center mb-8">
          <button
            onClick={handleRandomExercise}
            className={`flex items-center gap-3 px-6 py-3 rounded-xl text-lg font-medium shadow-lg transition-all hover:scale-105 text-white ${
              interleavingMode
                ? 'bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-400 hover:to-pink-400 shadow-orange-500/25 dark:shadow-orange-900/50'
                : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-purple-500/25 dark:shadow-purple-900/50'
            }`}
          >
            {interleavingMode ? <Layers className="w-6 h-6" /> : <Zap className="w-6 h-6" />}
            {interleavingMode ? 'Exercice mélangé' : 'Exercice aléatoire'}
            {!interleavingMode && activeFilter && (
              <span className="text-sm text-purple-200">
                ({lessonNames[activeFilter] || activeFilter})
              </span>
            )}
            {interleavingMode && selectedLessons.length > 0 && (
              <span className="text-sm text-orange-200">
                ({selectedLessons.length} chapitres)
              </span>
            )}
          </button>
        </div>

        {/* Exercice sélectionné */}
        {selectedTemplate && (
          <div className="mb-8">
            <RandomExercise template={selectedTemplate} onComplete={handleComplete} />
          </div>
        )}

        {/* Liste des templates disponibles */}
        <div>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
            Types d'exercices disponibles
            {activeFilter && (
              <span className="text-slate-500 dark:text-slate-400 text-base font-normal ml-2">
                ({lessonNames[activeFilter] || activeFilter})
              </span>
            )}
          </h2>

          <div className="grid gap-3">
            {filteredTemplates.map(template => (
              <button
                key={template.id}
                onClick={() => setSelectedTemplate(template)}
                className={`text-left p-4 rounded-lg border transition-all hover:scale-[1.01] ${
                  selectedTemplate?.id === template.id
                    ? 'bg-purple-100 dark:bg-purple-900/50 border-purple-500'
                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-500'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-medium text-slate-900 dark:text-white">{template.title}</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{template.description}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-xs ${trackColors[template.lessonId] || 'bg-slate-500 dark:bg-slate-600'} text-white`}>
                      {lessonNames[template.lessonId] || template.lessonId}
                    </span>
                    <span className="px-2 py-0.5 rounded text-xs bg-slate-200 dark:bg-slate-600 text-slate-600 dark:text-slate-300">
                      Niv. {template.difficulty}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2 mt-2">
                  {template.tags.slice(0, 3).map(tag => (
                    <span key={tag} className="text-xs text-slate-400 dark:text-slate-500">
                      #{tag}
                    </span>
                  ))}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
