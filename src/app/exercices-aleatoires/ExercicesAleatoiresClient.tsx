'use client'

import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { RandomExerciseTemplate } from '@/types'
import { RandomExercise } from '@/components/RandomExercise'
import { Shuffle, Filter, ChevronDown, Zap } from 'lucide-react'

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

export default function ExercicesAleatoiresClient() {
  const searchParams = useSearchParams()
  const lessonParam = searchParams.get('lesson')

  const [templates, setTemplates] = useState<RandomExerciseTemplate[]>([])
  const [selectedLesson, setSelectedLesson] = useState<string | null>(null)
  const [selectedTemplate, setSelectedTemplate] = useState<RandomExerciseTemplate | null>(null)
  const [loading, setLoading] = useState(true)
  const [showFilters, setShowFilters] = useState(false)
  const [completedCount, setCompletedCount] = useState(0)

  // Synchroniser le filtre avec le paramètre URL
  useEffect(() => {
    if (lessonParam) {
      setSelectedLesson(lessonParam)
      setShowFilters(true)
    }
  }, [lessonParam])

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

  // Filtrer les templates par leçon
  const filteredTemplates = selectedLesson
    ? templates.filter(t => t.lessonId === selectedLesson)
    : templates

  // Sélectionner un exercice aléatoire
  const handleRandomExercise = () => {
    const pool = selectedLesson
      ? templates.filter(t => t.lessonId === selectedLesson)
      : templates

    if (pool.length > 0) {
      const randomIndex = Math.floor(Math.random() * pool.length)
      setSelectedTemplate(pool[randomIndex])
    }
  }

  const handleComplete = () => {
    setCompletedCount(prev => prev + 1)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="h-10 bg-slate-800 rounded w-1/2 mb-6"></div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-20 bg-slate-800 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-900 to-indigo-900 py-8 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <Shuffle className="w-8 h-8 text-purple-400" />
            <h1 className="text-3xl font-bold text-white">Exercices Aléatoires</h1>
          </div>
          <p className="text-purple-200">
            Entraînement infini avec des valeurs qui changent à chaque fois
          </p>

          {/* Stats */}
          <div className="flex gap-6 mt-4">
            <div className="bg-white/10 rounded-lg px-4 py-2">
              <p className="text-sm text-purple-300">Templates disponibles</p>
              <p className="text-2xl font-bold text-white">{templates.length}</p>
            </div>
            <div className="bg-white/10 rounded-lg px-4 py-2">
              <p className="text-sm text-purple-300">Chapitres</p>
              <p className="text-2xl font-bold text-white">{uniqueLessons.length}</p>
            </div>
            <div className="bg-white/10 rounded-lg px-4 py-2">
              <p className="text-sm text-purple-300">Complétés (session)</p>
              <p className="text-2xl font-bold text-white">{completedCount}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6">
        {/* Filtres */}
        <div className="mb-6">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 text-slate-300 hover:text-white mb-3"
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
                  selectedLesson === null
                    ? 'bg-purple-600 text-white'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                Tous
              </button>
              {uniqueLessons.map(lessonId => (
                <button
                  key={lessonId}
                  onClick={() => setSelectedLesson(lessonId)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    selectedLesson === lessonId
                      ? `${trackColors[lessonId] || 'bg-purple-600'} text-white`
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  {lessonNames[lessonId] || lessonId}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Bouton exercice aléatoire */}
        <div className="flex justify-center mb-8">
          <button
            onClick={handleRandomExercise}
            className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 rounded-xl text-lg font-medium shadow-lg shadow-purple-900/50 transition-all hover:scale-105"
          >
            <Zap className="w-6 h-6" />
            Exercice aléatoire
            {selectedLesson && (
              <span className="text-sm text-purple-200">
                ({lessonNames[selectedLesson] || selectedLesson})
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
          <h2 className="text-xl font-semibold text-white mb-4">
            Types d'exercices disponibles
            {selectedLesson && (
              <span className="text-slate-400 text-base font-normal ml-2">
                ({lessonNames[selectedLesson] || selectedLesson})
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
                    ? 'bg-purple-900/50 border-purple-500'
                    : 'bg-slate-800 border-slate-700 hover:border-slate-500'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-medium text-white">{template.title}</h3>
                    <p className="text-sm text-slate-400 mt-1">{template.description}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-xs ${trackColors[template.lessonId] || 'bg-slate-600'} text-white`}>
                      {lessonNames[template.lessonId] || template.lessonId}
                    </span>
                    <span className="px-2 py-0.5 rounded text-xs bg-slate-600 text-slate-300">
                      Niv. {template.difficulty}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2 mt-2">
                  {template.tags.slice(0, 3).map(tag => (
                    <span key={tag} className="text-xs text-slate-500">
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
