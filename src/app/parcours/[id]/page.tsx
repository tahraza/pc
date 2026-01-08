'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  CheckCircle,
  Circle,
  Clock,
  BookOpen,
  FileQuestion,
  Brain,
  Play,
  Trophy,
  Target,
  TrendingUp,
  Atom,
  FlaskConical,
  RotateCcw,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useStore } from '@/store/useStore'

interface DayPlan {
  day: number
  theme: string
  lessons: string[]
  exercises: number
  flashcards: number
  quiz?: boolean
}

// Mapping des slugs de leçons vers leur track
const lessonTrackMap: Record<string, string> = {
  // Physique
  'ondes-mecaniques': 'physique',
  'ondes-lumineuses': 'physique',
  'mouvement-newton': 'physique',
  'mouvement-champ-uniforme': 'physique',
  'energie-mecanique': 'physique',
  'circuit-rc': 'physique',
  // Chimie
  'acides-bases': 'chimie',
  'oxydoreduction': 'chimie',
  'cinetique': 'chimie',
  'chimie-organique': 'chimie',
}

// Noms affichés pour les leçons
const lessonNames: Record<string, string> = {
  // Physique
  'ondes-mecaniques': 'Ondes mécaniques',
  'ondes-lumineuses': 'Ondes lumineuses',
  'mouvement-newton': 'Lois de Newton',
  'mouvement-champ-uniforme': 'Mouvement champ uniforme',
  'energie-mecanique': 'Énergie mécanique',
  'circuit-rc': 'Circuit RC',
  // Chimie
  'acides-bases': 'Acides et bases',
  'oxydoreduction': 'Oxydoréduction',
  'cinetique': 'Cinétique chimique',
  'chimie-organique': 'Chimie organique',
}

const parcoursData: Record<string, {
  id: string
  name: string
  description: string
  duration: string
  color: string
  icon: typeof Target
  days: DayPlan[]
}> = {
  'bac-30-jours': {
    id: 'bac-30-jours',
    name: 'Révision Bac 30 jours',
    description: 'Parcours intensif pour préparer le bac',
    duration: '30 jours',
    color: 'primary',
    icon: Target,
    days: [
      // Semaine 1 : Ondes
      { day: 1, theme: 'Ondes mécaniques - Bases', lessons: ['ondes-mecaniques'], exercises: 3, flashcards: 5, quiz: true },
      { day: 2, theme: 'Ondes mécaniques - Exercices', lessons: ['ondes-mecaniques'], exercises: 4, flashcards: 5 },
      { day: 3, theme: 'Ondes lumineuses', lessons: ['ondes-lumineuses'], exercises: 3, flashcards: 5, quiz: true },
      { day: 4, theme: 'Diffraction et interférences', lessons: ['ondes-lumineuses'], exercises: 4, flashcards: 5 },
      { day: 5, theme: 'Révision Ondes', lessons: ['ondes-mecaniques', 'ondes-lumineuses'], exercises: 5, flashcards: 10 },
      // Semaine 2 : Mécanique
      { day: 6, theme: 'Lois de Newton', lessons: ['mouvement-newton'], exercises: 3, flashcards: 5, quiz: true },
      { day: 7, theme: 'Newton - Applications', lessons: ['mouvement-newton'], exercises: 4, flashcards: 5 },
      { day: 8, theme: 'Mouvement dans un champ', lessons: ['mouvement-champ-uniforme'], exercises: 3, flashcards: 5, quiz: true },
      { day: 9, theme: 'Projectiles et champ électrique', lessons: ['mouvement-champ-uniforme'], exercises: 4, flashcards: 5 },
      { day: 10, theme: 'Révision Mécanique', lessons: ['mouvement-newton', 'mouvement-champ-uniforme'], exercises: 5, flashcards: 10 },
      // Semaine 3 : Énergie et RC
      { day: 11, theme: 'Énergie mécanique', lessons: ['energie-mecanique'], exercises: 3, flashcards: 5, quiz: true },
      { day: 12, theme: 'Conservation de l\'énergie', lessons: ['energie-mecanique'], exercises: 4, flashcards: 5 },
      { day: 13, theme: 'Circuit RC', lessons: ['circuit-rc'], exercises: 3, flashcards: 5, quiz: true },
      { day: 14, theme: 'RC - Charge et décharge', lessons: ['circuit-rc'], exercises: 4, flashcards: 5 },
      { day: 15, theme: 'Révision Physique mi-parcours', lessons: ['energie-mecanique', 'circuit-rc'], exercises: 5, flashcards: 10 },
      // Semaine 4 : Chimie
      { day: 16, theme: 'Acides et bases - pH', lessons: ['acides-bases'], exercises: 3, flashcards: 5, quiz: true },
      { day: 17, theme: 'Acides faibles et tampons', lessons: ['acides-bases'], exercises: 4, flashcards: 5 },
      { day: 18, theme: 'Oxydoréduction', lessons: ['oxydoreduction'], exercises: 3, flashcards: 5, quiz: true },
      { day: 19, theme: 'Piles et électrolyse', lessons: ['oxydoreduction'], exercises: 4, flashcards: 5 },
      { day: 20, theme: 'Révision Chimie 1', lessons: ['acides-bases', 'oxydoreduction'], exercises: 5, flashcards: 10 },
      // Semaine 5 : Cinétique et Organique
      { day: 21, theme: 'Cinétique chimique', lessons: ['cinetique'], exercises: 3, flashcards: 5, quiz: true },
      { day: 22, theme: 'Cinétique - Facteurs', lessons: ['cinetique'], exercises: 4, flashcards: 5 },
      { day: 23, theme: 'Chimie organique', lessons: ['chimie-organique'], exercises: 3, flashcards: 5, quiz: true },
      { day: 24, theme: 'Nomenclature', lessons: ['chimie-organique'], exercises: 4, flashcards: 5 },
      { day: 25, theme: 'Révision Chimie complète', lessons: ['cinetique', 'chimie-organique'], exercises: 5, flashcards: 10 },
      // Derniers jours
      { day: 26, theme: 'Révision Physique', lessons: ['ondes-mecaniques', 'mouvement-newton', 'energie-mecanique'], exercises: 6, flashcards: 10 },
      { day: 27, theme: 'Révision Chimie', lessons: ['acides-bases', 'oxydoreduction', 'cinetique'], exercises: 6, flashcards: 10 },
      { day: 28, theme: 'Exercices type Bac', lessons: [], exercises: 6, flashcards: 5 },
      { day: 29, theme: 'QCM de synthèse', lessons: [], exercises: 3, flashcards: 15, quiz: true },
      { day: 30, theme: 'Jour J-1 : Confiance', lessons: [], exercises: 0, flashcards: 10 },
    ],
  },
  'remise-niveau': {
    id: 'remise-niveau',
    name: 'Remise à niveau',
    description: 'Reprends les bases avant les chapitres avancés',
    duration: '15 jours',
    color: 'emerald',
    icon: TrendingUp,
    days: [
      { day: 1, theme: 'Diagnostic initial', lessons: ['ondes-mecaniques'], exercises: 0, flashcards: 0, quiz: true },
      { day: 2, theme: 'Ondes - Bases', lessons: ['ondes-mecaniques'], exercises: 2, flashcards: 5 },
      { day: 3, theme: 'Lumière', lessons: ['ondes-lumineuses'], exercises: 2, flashcards: 5 },
      { day: 4, theme: 'Newton - Bases', lessons: ['mouvement-newton'], exercises: 2, flashcards: 5, quiz: true },
      { day: 5, theme: 'Révision Physique 1', lessons: ['ondes-mecaniques', 'mouvement-newton'], exercises: 3, flashcards: 8 },
      { day: 6, theme: 'Projectiles', lessons: ['mouvement-champ-uniforme'], exercises: 2, flashcards: 5 },
      { day: 7, theme: 'Énergie', lessons: ['energie-mecanique'], exercises: 2, flashcards: 5, quiz: true },
      { day: 8, theme: 'Circuit RC', lessons: ['circuit-rc'], exercises: 2, flashcards: 5 },
      { day: 9, theme: 'Révision Physique', lessons: ['energie-mecanique', 'circuit-rc'], exercises: 3, flashcards: 8 },
      { day: 10, theme: 'pH et acides', lessons: ['acides-bases'], exercises: 2, flashcards: 5, quiz: true },
      { day: 11, theme: 'Oxydoréduction', lessons: ['oxydoreduction'], exercises: 2, flashcards: 5, quiz: true },
      { day: 12, theme: 'Cinétique', lessons: ['cinetique'], exercises: 2, flashcards: 5 },
      { day: 13, theme: 'Chimie organique', lessons: ['chimie-organique'], exercises: 2, flashcards: 5 },
      { day: 14, theme: 'Révision Chimie', lessons: ['acides-bases', 'oxydoreduction'], exercises: 3, flashcards: 8 },
      { day: 15, theme: 'Bilan final', lessons: [], exercises: 4, flashcards: 10, quiz: true },
    ],
  },
  'physique-only': {
    id: 'physique-only',
    name: 'Physique intensive',
    description: 'Programme complet de physique',
    duration: '20 jours',
    color: 'amber',
    icon: Atom,
    days: [
      // Ondes
      { day: 1, theme: 'Ondes mécaniques', lessons: ['ondes-mecaniques'], exercises: 3, flashcards: 5, quiz: true },
      { day: 2, theme: 'Ondes - Approfondissement', lessons: ['ondes-mecaniques'], exercises: 4, flashcards: 5 },
      { day: 3, theme: 'Ondes lumineuses', lessons: ['ondes-lumineuses'], exercises: 3, flashcards: 5, quiz: true },
      { day: 4, theme: 'Diffraction et interférences', lessons: ['ondes-lumineuses'], exercises: 4, flashcards: 5 },
      { day: 5, theme: 'Révision Ondes', lessons: ['ondes-mecaniques', 'ondes-lumineuses'], exercises: 5, flashcards: 10 },
      // Mécanique
      { day: 6, theme: 'Lois de Newton', lessons: ['mouvement-newton'], exercises: 3, flashcards: 5, quiz: true },
      { day: 7, theme: 'Newton - Problèmes', lessons: ['mouvement-newton'], exercises: 5, flashcards: 5 },
      { day: 8, theme: 'Champ uniforme', lessons: ['mouvement-champ-uniforme'], exercises: 3, flashcards: 5, quiz: true },
      { day: 9, theme: 'Projectiles', lessons: ['mouvement-champ-uniforme'], exercises: 5, flashcards: 5 },
      { day: 10, theme: 'Révision Mécanique', lessons: ['mouvement-newton', 'mouvement-champ-uniforme'], exercises: 5, flashcards: 10 },
      // Énergie
      { day: 11, theme: 'Énergie mécanique', lessons: ['energie-mecanique'], exercises: 3, flashcards: 5, quiz: true },
      { day: 12, theme: 'Conservation', lessons: ['energie-mecanique'], exercises: 5, flashcards: 5 },
      { day: 13, theme: 'Travail et puissance', lessons: ['energie-mecanique'], exercises: 4, flashcards: 5 },
      // Électricité
      { day: 14, theme: 'Circuit RC', lessons: ['circuit-rc'], exercises: 3, flashcards: 5, quiz: true },
      { day: 15, theme: 'Charge et décharge', lessons: ['circuit-rc'], exercises: 5, flashcards: 5 },
      { day: 16, theme: 'Révision Énergie + RC', lessons: ['energie-mecanique', 'circuit-rc'], exercises: 5, flashcards: 10 },
      // Révisions
      { day: 17, theme: 'Révision Ondes', lessons: ['ondes-mecaniques', 'ondes-lumineuses'], exercises: 5, flashcards: 8 },
      { day: 18, theme: 'Révision Mécanique', lessons: ['mouvement-newton', 'mouvement-champ-uniforme'], exercises: 5, flashcards: 8 },
      { day: 19, theme: 'Exercices type Bac', lessons: [], exercises: 6, flashcards: 5 },
      { day: 20, theme: 'Bilan final', lessons: [], exercises: 4, flashcards: 15, quiz: true },
    ],
  },
  'chimie-only': {
    id: 'chimie-only',
    name: 'Chimie intensive',
    description: 'Programme complet de chimie',
    duration: '20 jours',
    color: 'purple',
    icon: FlaskConical,
    days: [
      // Acides-bases
      { day: 1, theme: 'pH et acides forts', lessons: ['acides-bases'], exercises: 3, flashcards: 5, quiz: true },
      { day: 2, theme: 'Acides faibles', lessons: ['acides-bases'], exercises: 4, flashcards: 5 },
      { day: 3, theme: 'Bases et tampons', lessons: ['acides-bases'], exercises: 4, flashcards: 5 },
      { day: 4, theme: 'Titrages', lessons: ['acides-bases'], exercises: 5, flashcards: 5 },
      { day: 5, theme: 'Révision Acides-Bases', lessons: ['acides-bases'], exercises: 5, flashcards: 10 },
      // Redox
      { day: 6, theme: 'Oxydants et réducteurs', lessons: ['oxydoreduction'], exercises: 3, flashcards: 5, quiz: true },
      { day: 7, theme: 'Équilibrage redox', lessons: ['oxydoreduction'], exercises: 5, flashcards: 5 },
      { day: 8, theme: 'Piles', lessons: ['oxydoreduction'], exercises: 4, flashcards: 5 },
      { day: 9, theme: 'Électrolyse', lessons: ['oxydoreduction'], exercises: 4, flashcards: 5 },
      { day: 10, theme: 'Révision Redox', lessons: ['oxydoreduction'], exercises: 5, flashcards: 10 },
      // Cinétique
      { day: 11, theme: 'Vitesse de réaction', lessons: ['cinetique'], exercises: 3, flashcards: 5, quiz: true },
      { day: 12, theme: 'Facteurs cinétiques', lessons: ['cinetique'], exercises: 4, flashcards: 5 },
      { day: 13, theme: 'Catalyse', lessons: ['cinetique'], exercises: 4, flashcards: 5 },
      // Organique
      { day: 14, theme: 'Groupes fonctionnels', lessons: ['chimie-organique'], exercises: 3, flashcards: 5, quiz: true },
      { day: 15, theme: 'Nomenclature', lessons: ['chimie-organique'], exercises: 5, flashcards: 5 },
      { day: 16, theme: 'Révision Cinétique + Orga', lessons: ['cinetique', 'chimie-organique'], exercises: 5, flashcards: 10 },
      // Révisions
      { day: 17, theme: 'Révision Acides-Bases', lessons: ['acides-bases'], exercises: 5, flashcards: 8 },
      { day: 18, theme: 'Révision Redox', lessons: ['oxydoreduction'], exercises: 5, flashcards: 8 },
      { day: 19, theme: 'Exercices type Bac', lessons: [], exercises: 6, flashcards: 5 },
      { day: 20, theme: 'Bilan final', lessons: [], exercises: 4, flashcards: 15, quiz: true },
    ],
  },
}

export default function ParcoursDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string
  const parcours = parcoursData[id]

  const { activePath, startPath, updatePathProgress, clearActivePath } = useStore()
  const [currentDay, setCurrentDay] = useState(1)

  useEffect(() => {
    if (activePath?.pathId === id) {
      setCurrentDay(activePath.currentDay)
    }
  }, [activePath, id])

  if (!parcours) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-8">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Parcours non trouvé</h1>
          <p className="mt-2 text-slate-600 dark:text-slate-400">Ce parcours n'existe pas.</p>
          <Link href="/parcours" className="btn-primary mt-4 inline-block">
            Retour aux parcours
          </Link>
        </div>
      </div>
    )
  }

  const Icon = parcours.icon
  const isActive = activePath?.pathId === id
  const completedDays = activePath?.completedDays || []

  const getColorClasses = (color: string) => {
    const colors: Record<string, { bg: string; text: string; border: string; light: string }> = {
      primary: { bg: 'bg-primary-600', text: 'text-primary-600', border: 'border-primary-200', light: 'bg-primary-50' },
      emerald: { bg: 'bg-emerald-600', text: 'text-emerald-600', border: 'border-emerald-200', light: 'bg-emerald-50' },
      amber: { bg: 'bg-amber-600', text: 'text-amber-600', border: 'border-amber-200', light: 'bg-amber-50' },
      purple: { bg: 'bg-purple-600', text: 'text-purple-600', border: 'border-purple-200', light: 'bg-purple-50' },
    }
    return colors[color] || colors.primary
  }

  const colors = getColorClasses(parcours.color)

  const handleStartParcours = () => {
    startPath(id)
    setCurrentDay(1)
  }

  const handleCompleteDay = (day: number) => {
    updatePathProgress(day)
    if (day < parcours.days.length) {
      setCurrentDay(day + 1)
    }
  }

  const handleResetParcours = () => {
    if (confirm('Voulez-vous vraiment réinitialiser ce parcours ? Toute la progression sera perdue.')) {
      clearActivePath()
      setCurrentDay(1)
    }
  }

  const handleRestartParcours = () => {
    if (confirm('Voulez-vous recommencer ce parcours depuis le début ?')) {
      clearActivePath()
      startPath(id)
      setCurrentDay(1)
    }
  }

  const handleGoBack = () => {
    if (currentDay > 1) {
      setCurrentDay(currentDay - 1)
    }
  }

  const progress = isActive ? (completedDays.length / parcours.days.length) * 100 : 0

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-8">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Back button */}
        <Link
          href="/parcours"
          className="inline-flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour aux parcours
        </Link>

        {/* Header */}
        <div className={cn('rounded-xl p-6 mb-8 text-white', colors.bg)}>
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-white/20">
              <Icon className="h-7 w-7" />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold">{parcours.name}</h1>
              <p className="mt-1 text-white/80">{parcours.description}</p>
              <div className="flex items-center gap-4 mt-3 text-sm text-white/80">
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {parcours.duration}
                </span>
                <span className="flex items-center gap-1">
                  <Target className="h-4 w-4" />
                  {parcours.days.length} jours
                </span>
              </div>
            </div>
          </div>

          {isActive && (
            <div className="mt-6">
              <div className="flex justify-between text-sm mb-2">
                <span>Progression</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="mt-4 flex gap-4">
                <button
                  onClick={handleRestartParcours}
                  className="text-sm text-white/80 hover:text-white flex items-center gap-1"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Recommencer depuis le début
                </button>
                <span className="text-white/40">|</span>
                <button
                  onClick={handleResetParcours}
                  className="text-sm text-white/80 hover:text-white"
                >
                  Abandonner le parcours
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Start button if not active */}
        {!isActive && !activePath && (
          <div className="mb-8">
            <button
              onClick={handleStartParcours}
              className={cn('btn w-full justify-center text-white text-lg py-4', colors.bg)}
            >
              <Play className="h-5 w-5 mr-2" />
              Commencer ce parcours
            </button>
          </div>
        )}

        {/* Navigation between days */}
        {isActive && (
          <div className="mb-6 flex items-center justify-between">
            <button
              onClick={handleGoBack}
              disabled={currentDay <= 1}
              className={cn(
                "btn-secondary flex items-center gap-2",
                currentDay <= 1 && "opacity-50 cursor-not-allowed"
              )}
            >
              <ArrowLeft className="h-4 w-4" />
              Jour précédent
            </button>
            <span className="text-slate-600 dark:text-slate-400">
              Jour actuel : <strong>{currentDay}</strong> / {parcours.days.length}
            </span>
            <button
              onClick={() => setCurrentDay(Math.min(currentDay + 1, parcours.days.length))}
              disabled={currentDay >= parcours.days.length}
              className={cn(
                "btn-secondary flex items-center gap-2",
                currentDay >= parcours.days.length && "opacity-50 cursor-not-allowed"
              )}
            >
              Jour suivant
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Days list */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">Programme jour par jour</h2>

          {parcours.days.map((day) => {
            const isCompleted = completedDays.includes(day.day)
            const isCurrent = isActive && currentDay === day.day
            const isLocked = isActive && day.day > currentDay && !isCompleted
            const isAccessible = !isActive || isCurrent || isCompleted || day.day <= currentDay

            return (
              <div
                key={day.day}
                className={cn(
                  'rounded-xl border bg-white dark:bg-slate-800 p-4 transition-all',
                  isCurrent && `${colors.border} ${colors.light}`,
                  isCompleted && 'bg-success-50 dark:bg-success-900/30 border-success-200 dark:border-success-800',
                  isLocked && 'opacity-60',
                  !isCurrent && !isCompleted && 'border-slate-200 dark:border-slate-700'
                )}
              >
                <div className="flex items-start gap-4">
                  {/* Day indicator */}
                  <div
                    className={cn(
                      'flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold',
                      isCompleted
                        ? 'bg-success-500 text-white'
                        : isCurrent
                        ? `${colors.bg} text-white`
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                    )}
                  >
                    {isCompleted ? <CheckCircle className="h-5 w-5" /> : day.day}
                  </div>

                  {/* Day content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-4">
                      <h3 className="font-semibold text-slate-900 dark:text-slate-100">{day.theme}</h3>
                      {/* Action */}
                      {isCurrent && (
                        <button
                          onClick={() => handleCompleteDay(day.day)}
                          className={cn('btn text-white flex-shrink-0', colors.bg)}
                        >
                          Terminer
                        </button>
                      )}
                      {isCompleted && (
                        <span className="text-success-600 font-medium flex items-center gap-1 flex-shrink-0">
                          <Trophy className="h-4 w-4" />
                          Fait
                        </span>
                      )}
                    </div>

                    {/* Summary badges */}
                    <div className="flex flex-wrap gap-3 mt-1 text-sm text-slate-600 dark:text-slate-400">
                      {day.lessons.length > 0 && (
                        <span className="flex items-center gap-1">
                          <BookOpen className="h-3.5 w-3.5" />
                          {day.lessons.length} leçon{day.lessons.length > 1 ? 's' : ''}
                        </span>
                      )}
                      {day.exercises > 0 && (
                        <span className="flex items-center gap-1">
                          <FileQuestion className="h-3.5 w-3.5" />
                          {day.exercises} exercices
                        </span>
                      )}
                      {day.flashcards > 0 && (
                        <span className="flex items-center gap-1">
                          <Brain className="h-3.5 w-3.5" />
                          {day.flashcards} flashcards
                        </span>
                      )}
                      {day.quiz && (
                        <span className="badge bg-amber-100 text-amber-700 text-xs">Quiz</span>
                      )}
                    </div>

                    {/* Detailed links - shown for current or accessible days */}
                    {isAccessible && (day.lessons.length > 0 || day.exercises > 0 || day.flashcards > 0 || day.quiz) && (
                      <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700 space-y-2">
                        {/* Lesson links */}
                        {day.lessons.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            <span className="text-xs text-slate-500 dark:text-slate-500 w-16 flex-shrink-0">Leçons :</span>
                            {day.lessons.map((lessonSlug) => (
                              <Link
                                key={lessonSlug}
                                href={`/lecons/${lessonTrackMap[lessonSlug] || 'physique'}/${lessonSlug}`}
                                className="inline-flex items-center gap-1 text-sm text-primary-600 hover:text-primary-800 hover:underline"
                              >
                                <BookOpen className="h-3.5 w-3.5" />
                                {lessonNames[lessonSlug] || lessonSlug}
                              </Link>
                            ))}
                          </div>
                        )}

                        {/* Quiz link */}
                        {day.quiz && day.lessons.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            <span className="text-xs text-slate-500 dark:text-slate-500 w-16 flex-shrink-0">QCM :</span>
                            {day.lessons.map((lessonSlug) => (
                              <Link
                                key={`quiz-${lessonSlug}`}
                                href={`/qcm/quiz-pre-${lessonSlug}`}
                                className="inline-flex items-center gap-1 text-sm text-amber-600 hover:text-amber-800 hover:underline"
                              >
                                <Target className="h-3.5 w-3.5" />
                                QCM {lessonNames[lessonSlug] || lessonSlug}
                              </Link>
                            ))}
                          </div>
                        )}

                        {/* Exercises link */}
                        {day.exercises > 0 && (
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-xs text-slate-500 dark:text-slate-500 w-16 flex-shrink-0">Exercices :</span>
                            {day.lessons.length > 0 ? (
                              day.lessons.map((lessonSlug) => (
                                <Link
                                  key={`ex-${lessonSlug}`}
                                  href={`/exercices?lesson=${lessonSlug}`}
                                  className="inline-flex items-center gap-1 text-sm text-emerald-600 hover:text-emerald-800 hover:underline"
                                >
                                  <FileQuestion className="h-3.5 w-3.5" />
                                  {lessonNames[lessonSlug] || lessonSlug}
                                </Link>
                              ))
                            ) : (
                              <Link
                                href="/exercices"
                                className="inline-flex items-center gap-1 text-sm text-emerald-600 hover:text-emerald-800 hover:underline"
                              >
                                <FileQuestion className="h-3.5 w-3.5" />
                                Tous les exercices ({day.exercises} à faire)
                              </Link>
                            )}
                          </div>
                        )}

                        {/* Flashcards link */}
                        {day.flashcards > 0 && (
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-xs text-slate-500 dark:text-slate-500 w-16 flex-shrink-0">Flashcards :</span>
                            {day.lessons.length > 0 ? (
                              day.lessons.map((lessonSlug) => (
                                <Link
                                  key={`fc-${lessonSlug}`}
                                  href={`/flashcards?lesson=${lessonSlug}`}
                                  className="inline-flex items-center gap-1 text-sm text-purple-600 hover:text-purple-800 hover:underline"
                                >
                                  <Brain className="h-3.5 w-3.5" />
                                  {lessonNames[lessonSlug] || lessonSlug}
                                </Link>
                              ))
                            ) : (
                              <Link
                                href="/flashcards"
                                className="inline-flex items-center gap-1 text-sm text-purple-600 hover:text-purple-800 hover:underline"
                              >
                                <Brain className="h-3.5 w-3.5" />
                                Toutes les flashcards ({day.flashcards})
                              </Link>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Completion message */}
        {isActive && completedDays.length === parcours.days.length && (
          <div className="mt-8 rounded-xl bg-success-100 dark:bg-success-900/30 border border-success-200 dark:border-success-800 p-6 text-center">
            <Trophy className="h-12 w-12 text-success-600 dark:text-success-400 mx-auto mb-3" />
            <h2 className="text-xl font-bold text-success-900 dark:text-success-100">Parcours terminé !</h2>
            <p className="mt-2 text-success-700 dark:text-success-300">
              Félicitations ! Tu as complété tous les jours de ce parcours.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
