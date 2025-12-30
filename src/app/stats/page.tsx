'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  BarChart3,
  BookOpen,
  Brain,
  ClipboardList,
  FileQuestion,
  Flame,
  Trophy,
  Clock,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Calendar,
  Star,
} from 'lucide-react'
import { cn, formatDuration } from '@/lib/utils'
import { useStore } from '@/store/useStore'
import { VirtualPet } from '@/components/VirtualPet'
import { BadgesDisplay, BadgesModal } from '@/components/BadgesDisplay'
import { WeeklyChallenges } from '@/components/WeeklyChallenges'
import { GamificationStatus } from '@/components/GamificationStatus'
import { ProgressBackup } from '@/components/ProgressBackup'
import { PetShop } from '@/components/PetShop'
import { PetSideQuests } from '@/components/PetSideQuests'
import { useGamificationStore } from '@/stores/gamificationStore'

export default function StatsPage() {
  const { stats, lessonProgress, exerciseProgress, flashcardProgress, quizAttempts, dailyActivities } = useStore()
  const { totalPoints, currentStreak, longestStreak } = useGamificationStore()
  const [mounted, setMounted] = useState(false)
  const [showBadgesModal, setShowBadgesModal] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-600 border-t-transparent" />
      </div>
    )
  }

  // Calculate stats
  const lessonsCompleted = Object.values(lessonProgress).filter((p) => p.status === 'mastered').length
  const lessonsInProgress = Object.values(lessonProgress).filter((p) => p.status === 'in_progress').length
  const lessonsToReview = Object.values(lessonProgress).filter((p) => p.status === 'to_review').length

  const exercisesCompleted = Object.values(exerciseProgress).filter((p) => p.status === 'completed').length
  const exercisesAttempted = Object.values(exerciseProgress).filter((p) => p.status === 'attempted').length

  const flashcardsMastered = Object.values(flashcardProgress).filter((p) => p.status === 'mastered').length
  const flashcardsLearning = Object.values(flashcardProgress).filter((p) => p.status === 'learning' || p.status === 'review').length

  const recentActivity = Object.entries(dailyActivities)
    .sort(([a], [b]) => b.localeCompare(a))
    .slice(0, 7)

  // Get last 7 days for activity heatmap
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - (6 - i))
    return date.toISOString().split('T')[0]
  })

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header with gamification status */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-3">
              <BarChart3 className="h-8 w-8 text-primary-600" />
              Mes statistiques
            </h1>
            <p className="mt-2 text-slate-600 dark:text-slate-400">
              Suis ta progression et identifie les points à améliorer
            </p>
          </div>
          <div className="flex items-center gap-3">
            <ProgressBackup />
            <GamificationStatus />
          </div>
        </div>

        {/* Pet, Shop, Traits/Quests, and Challenges Row */}
        <div className="mb-8 grid gap-6 md:grid-cols-2">
          <VirtualPet />
          <PetShop />
          <PetSideQuests />
          <WeeklyChallenges />
        </div>

        {/* Badges Section */}
        <div className="mb-8 rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="flex items-center gap-2 font-bold text-slate-900 dark:text-slate-100">
              <Trophy className="h-5 w-5 text-amber-500" />
              Mes badges
            </h2>
            <button
              onClick={() => setShowBadgesModal(true)}
              className="text-sm font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
            >
              Voir tous
            </button>
          </div>
          <BadgesDisplay maxDisplay={8} />
        </div>

        {/* Main stats cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          {/* Points */}
          <div className="card bg-gradient-to-br from-primary-50 to-white border-primary-200 dark:from-primary-900/30 dark:to-slate-800 dark:border-primary-800">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-600 text-white">
                <Star className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Points totaux</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{totalPoints}</p>
              </div>
            </div>
            <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
              Continue pour faire évoluer ton animal !
            </p>
          </div>

          {/* Streak */}
          <div className="card bg-gradient-to-br from-amber-50 to-white border-amber-200 dark:from-amber-900/30 dark:to-slate-800 dark:border-amber-800">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500 text-white">
                <Flame className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Série actuelle</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{currentStreak} jours</p>
              </div>
            </div>
            <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
              Record : {longestStreak} jours
            </p>
          </div>

          {/* Lessons */}
          <div className="card bg-gradient-to-br from-emerald-50 to-white border-emerald-200 dark:from-emerald-900/30 dark:to-slate-800 dark:border-emerald-800">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-600 text-white">
                <BookOpen className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Leçons maîtrisées</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{lessonsCompleted}</p>
              </div>
            </div>
            <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
              {lessonsInProgress} en cours • {lessonsToReview} à revoir
            </p>
          </div>

          {/* Quiz average */}
          <div className="card bg-gradient-to-br from-purple-50 to-white border-purple-200 dark:from-purple-900/30 dark:to-slate-800 dark:border-purple-800">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-600 text-white">
                <Trophy className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Score moyen QCM</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  {stats.totalQuizzesTaken > 0 ? Math.round(stats.averageQuizScore) : '-'}%
                </p>
              </div>
            </div>
            <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
              Sur {stats.totalQuizzesTaken} QCM
            </p>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Left column - Activity & Progress */}
          <div className="lg:col-span-2 space-y-8">
            {/* Weekly activity */}
            <div className="card">
              <h2 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary-600" />
                Activité des 7 derniers jours
              </h2>
              <div className="grid grid-cols-7 gap-2">
                {last7Days.map((date) => {
                  const activity = dailyActivities[date]
                  const hasActivity = activity && (
                    activity.lessonsViewed.length > 0 ||
                    activity.exercisesCompleted.length > 0 ||
                    activity.flashcardsReviewed.length > 0 ||
                    activity.quizzesTaken.length > 0
                  )
                  const intensity = activity
                    ? Math.min(4, activity.lessonsViewed.length + activity.exercisesCompleted.length + Math.floor(activity.flashcardsReviewed.length / 5))
                    : 0

                  return (
                    <div key={date} className="text-center">
                      <div
                        className={cn(
                          'h-10 w-full rounded-lg',
                          intensity === 0 && 'bg-slate-100',
                          intensity === 1 && 'bg-primary-200',
                          intensity === 2 && 'bg-primary-300',
                          intensity === 3 && 'bg-primary-400',
                          intensity >= 4 && 'bg-primary-500'
                        )}
                        title={`${date}: ${activity?.lessonsViewed.length || 0} leçons, ${activity?.exercisesCompleted.length || 0} exercices`}
                      />
                      <p className="text-xs text-slate-500 mt-1">
                        {new Date(date).toLocaleDateString('fr-FR', { weekday: 'short' })}
                      </p>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Detailed progress */}
            <div className="card">
              <h2 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary-600" />
                Progression détaillée
              </h2>

              <div className="space-y-6">
                {/* Exercises */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="flex items-center gap-2 text-sm font-medium text-slate-700">
                      <ClipboardList className="h-4 w-4 text-amber-600" />
                      Exercices
                    </span>
                    <span className="text-sm text-slate-500">
                      {exercisesCompleted} terminés
                    </span>
                  </div>
                  <div className="progress-bar">
                    <div
                      className="progress-bar-fill bg-amber-500"
                      style={{ width: `${Math.min(100, (exercisesCompleted / 40) * 100)}%` }}
                    />
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    {exercisesAttempted} tentés mais non terminés
                  </p>
                </div>

                {/* Flashcards */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="flex items-center gap-2 text-sm font-medium text-slate-700">
                      <Brain className="h-4 w-4 text-purple-600" />
                      Flashcards
                    </span>
                    <span className="text-sm text-slate-500">
                      {flashcardsMastered} maîtrisées
                    </span>
                  </div>
                  <div className="progress-bar">
                    <div
                      className="progress-bar-fill bg-purple-500"
                      style={{ width: `${Math.min(100, (flashcardsMastered / 60) * 100)}%` }}
                    />
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    {flashcardsLearning} en apprentissage
                  </p>
                </div>

                {/* QCM */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="flex items-center gap-2 text-sm font-medium text-slate-700">
                      <FileQuestion className="h-4 w-4 text-emerald-600" />
                      QCM
                    </span>
                    <span className="text-sm text-slate-500">
                      {stats.totalQuizzesTaken} passés
                    </span>
                  </div>
                  <div className="progress-bar">
                    <div
                      className="progress-bar-fill bg-emerald-500"
                      style={{ width: `${Math.min(100, stats.averageQuizScore)}%` }}
                    />
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Score moyen : {stats.totalQuizzesTaken > 0 ? Math.round(stats.averageQuizScore) : '-'}%
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right column - Topics */}
          <div className="space-y-8">
            {/* Weak topics */}
            <div className="card">
              <h2 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-warning-500" />
                Points à travailler
              </h2>
              {lessonsToReview > 0 ? (
                <ul className="space-y-2">
                  {Object.entries(lessonProgress)
                    .filter(([_, p]) => p.status === 'to_review')
                    .slice(0, 5)
                    .map(([id, _]) => (
                      <li key={id}>
                        <Link
                          href={`/lecons?id=${id}`}
                          className="text-sm text-slate-600 hover:text-primary-600"
                        >
                          Leçon à revoir
                        </Link>
                      </li>
                    ))}
                </ul>
              ) : (
                <p className="text-sm text-slate-500">
                  Aucune leçon marquée "à revoir" pour le moment.
                </p>
              )}

              {stats.weakTopics.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm text-slate-600 mb-2">Notions fragiles :</p>
                  <div className="flex flex-wrap gap-1">
                    {stats.weakTopics.map((topic) => (
                      <span
                        key={topic}
                        className="badge badge-warning text-xs"
                      >
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Strong topics */}
            <div className="card">
              <h2 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-success-500" />
                Points forts
              </h2>
              {lessonsCompleted > 0 ? (
                <p className="text-sm text-slate-600">
                  Tu maîtrises {lessonsCompleted} leçon{lessonsCompleted > 1 ? 's' : ''}.
                  Continue comme ça !
                </p>
              ) : (
                <p className="text-sm text-slate-500">
                  Termine des leçons pour voir tes points forts ici.
                </p>
              )}

              {stats.strongTopics.length > 0 && (
                <div className="mt-4">
                  <div className="flex flex-wrap gap-1">
                    {stats.strongTopics.map((topic) => (
                      <span
                        key={topic}
                        className="badge badge-success text-xs"
                      >
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Quick actions */}
            <div className="card">
              <h2 className="font-semibold text-slate-900 mb-4">Actions rapides</h2>
              <div className="space-y-2">
                <Link
                  href="/revision"
                  className="btn-primary w-full justify-center"
                >
                  Session de révision
                </Link>
                <Link
                  href="/flashcards"
                  className="btn-secondary w-full justify-center"
                >
                  Réviser les flashcards
                </Link>
                <Link
                  href="/lecons?status=to_review"
                  className="btn-outline w-full justify-center"
                >
                  Revoir les leçons
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Badges Modal */}
      <BadgesModal open={showBadgesModal} onClose={() => setShowBadgesModal(false)} />
    </div>
  )
}
