'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  GraduationCap,
  Calendar,
  Clock,
  Target,
  Zap,
  TrendingUp,
  CheckCircle,
  Play,
  ArrowRight,
  Atom,
  FlaskConical,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useStore } from '@/store/useStore'

const parcours = [
  {
    id: 'bac-30-jours',
    name: 'Révision Bac 30 jours',
    description: 'Parcours intensif pour préparer le bac. Couvre tout le programme de physique-chimie avec une progression optimisée.',
    duration: '30 jours',
    tracks: ['physique', 'chimie'],
    estimatedDaily: '45-60 min',
    difficulty: 'mixed',
    icon: Target,
    color: 'primary',
    features: [
      'Programme complet physique-chimie',
      'Révisions espacées intégrées',
      'QCM quotidiens',
      'Exercices type bac',
    ],
  },
  {
    id: 'remise-niveau',
    name: 'Remise à niveau',
    description: 'Reprends les bases solides avant d\'attaquer les chapitres avancés. Idéal en début d\'année ou après une pause.',
    duration: '15 jours',
    tracks: ['physique', 'chimie'],
    estimatedDaily: '30-45 min',
    difficulty: 'progressive',
    icon: TrendingUp,
    color: 'emerald',
    features: [
      'Focus sur les prérequis',
      'Progression très graduelle',
      'Exercices de consolidation',
      'Diagnostic initial',
    ],
  },
  {
    id: 'physique-only',
    name: 'Physique intensive',
    description: 'Parcours dédié à la physique : ondes, mécanique, énergie et circuits électriques.',
    duration: '20 jours',
    tracks: ['physique'],
    estimatedDaily: '45-60 min',
    difficulty: 'mixed',
    icon: Atom,
    color: 'amber',
    features: [
      'Programme complet physique',
      'Ondes, mécanique, énergie',
      'Circuits RC',
      'Exercices types',
    ],
  },
  {
    id: 'chimie-only',
    name: 'Chimie intensive',
    description: 'Parcours dédié à la chimie : acides-bases, oxydoréduction, cinétique et chimie organique.',
    duration: '20 jours',
    tracks: ['chimie'],
    estimatedDaily: '45-60 min',
    difficulty: 'mixed',
    icon: FlaskConical,
    color: 'purple',
    features: [
      'Programme complet chimie',
      'Acides-bases, redox',
      'Cinétique, organique',
      'Exercices types',
    ],
  },
]

export default function ParcoursPage() {
  const { activePath, startPath, clearActivePath } = useStore()
  const [selectedParcours, setSelectedParcours] = useState<string | null>(null)

  const handleStartPath = (pathId: string) => {
    startPath(pathId)
    setSelectedParcours(null)
  }

  const getColorClasses = (color: string) => {
    const colors: Record<string, { bg: string; text: string; border: string; light: string }> = {
      primary: {
        bg: 'bg-primary-600',
        text: 'text-primary-600',
        border: 'border-primary-200',
        light: 'bg-primary-50',
      },
      emerald: {
        bg: 'bg-emerald-600',
        text: 'text-emerald-600',
        border: 'border-emerald-200',
        light: 'bg-emerald-50',
      },
      amber: {
        bg: 'bg-amber-600',
        text: 'text-amber-600',
        border: 'border-amber-200',
        light: 'bg-amber-50',
      },
      purple: {
        bg: 'bg-purple-600',
        text: 'text-purple-600',
        border: 'border-purple-200',
        light: 'bg-purple-50',
      },
    }
    return colors[color] || colors.primary
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 flex items-center justify-center gap-3">
            <GraduationCap className="h-9 w-9 text-primary-600" />
            Parcours de révision
          </h1>
          <p className="mt-3 text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Choisis un parcours adapté à tes objectifs. Chaque parcours propose une progression
            structurée avec des objectifs quotidiens.
          </p>
        </div>

        {/* Active path banner */}
        {activePath && (
          <div className="mb-8 rounded-xl border border-success-200 dark:border-success-800 bg-success-50 dark:bg-success-900/30 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-semibold text-success-900 dark:text-success-100 flex items-center gap-2">
                  <Play className="h-5 w-5" />
                  Parcours en cours
                </h2>
                <p className="mt-1 text-success-800 dark:text-success-200">
                  {parcours.find((p) => p.id === activePath.pathId)?.name}
                </p>
                <p className="text-sm text-success-700 dark:text-success-300 mt-1">
                  Jour {activePath.currentDay} • {activePath.completedDays.length} jours complétés
                </p>
              </div>
              <div className="flex gap-3">
                <Link
                  href={`/parcours/${activePath.pathId}`}
                  className="btn-success flex items-center gap-2"
                >
                  Continuer
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <button
                  onClick={clearActivePath}
                  className="btn-outline text-sm"
                >
                  Abandonner
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Parcours grid */}
        <div className="grid gap-6 md:grid-cols-2">
          {parcours.map((p) => {
            const Icon = p.icon
            const colors = getColorClasses(p.color)
            const isActive = activePath?.pathId === p.id

            return (
              <div
                key={p.id}
                className={cn(
                  'card transition-all hover:shadow-lg',
                  isActive && `${colors.border} ${colors.light}`,
                  selectedParcours === p.id && 'ring-2 ring-offset-2',
                  selectedParcours === p.id && `ring-${p.color}-500`
                )}
              >
                <div className="flex items-start gap-4">
                  <div className={cn('flex h-12 w-12 items-center justify-center rounded-xl text-white', colors.bg)}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">{p.name}</h3>
                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{p.description}</p>
                  </div>
                </div>

                {/* Stats */}
                <div className="mt-4 flex flex-wrap gap-4 text-sm">
                  <div className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
                    <Calendar className="h-4 w-4" />
                    {p.duration}
                  </div>
                  <div className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
                    <Clock className="h-4 w-4" />
                    {p.estimatedDaily}/jour
                  </div>
                  <div className="flex items-center gap-1">
                    {p.tracks.map((track) => (
                      <span
                        key={track}
                        className={cn(
                          'badge text-xs',
                          track === 'physique' ? 'bg-primary-100 text-primary-700' : 'bg-emerald-100 text-emerald-700'
                        )}
                      >
                        {track === 'physique' ? 'Phy' : 'Chi'}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Features */}
                <ul className="mt-4 space-y-2">
                  {p.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                      <CheckCircle className={cn('h-4 w-4', colors.text)} />
                      {feature}
                    </li>
                  ))}
                </ul>

                {/* Action button */}
                <div className="mt-6">
                  {isActive ? (
                    <Link
                      href={`/parcours/${p.id}`}
                      className={cn('btn w-full justify-center text-white', colors.bg)}
                    >
                      Continuer le parcours
                    </Link>
                  ) : activePath ? (
                    <button
                      disabled
                      className="btn w-full justify-center bg-slate-100 text-slate-400 cursor-not-allowed"
                    >
                      Un parcours est déjà en cours
                    </button>
                  ) : (
                    <button
                      onClick={() => handleStartPath(p.id)}
                      className={cn('btn w-full justify-center text-white', colors.bg, `hover:opacity-90`)}
                    >
                      Commencer ce parcours
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Info section */}
        <div className="mt-12 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-8">
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-4">Comment fonctionnent les parcours ?</h2>
          <div className="grid gap-6 md:grid-cols-3">
            <div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-100 dark:bg-primary-900/50 text-primary-600 dark:text-primary-400 mb-3">
                <span className="font-bold">1</span>
              </div>
              <h3 className="font-semibold text-slate-900 dark:text-slate-100">Objectifs quotidiens</h3>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                Chaque jour, tu as des leçons à revoir, des exercices à faire et des flashcards à réviser.
              </p>
            </div>
            <div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-100 dark:bg-primary-900/50 text-primary-600 dark:text-primary-400 mb-3">
                <span className="font-bold">2</span>
              </div>
              <h3 className="font-semibold text-slate-900 dark:text-slate-100">Suivi de progression</h3>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                Ta progression est sauvegardée. Tu peux reprendre où tu en étais à tout moment.
              </p>
            </div>
            <div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-100 dark:bg-primary-900/50 text-primary-600 dark:text-primary-400 mb-3">
                <span className="font-bold">3</span>
              </div>
              <h3 className="font-semibold text-slate-900 dark:text-slate-100">Révision espacée</h3>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                Le parcours intègre automatiquement des révisions espacées pour ancrer les connaissances.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
