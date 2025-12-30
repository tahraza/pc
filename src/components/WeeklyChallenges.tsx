'use client'

import { useEffect, useState } from 'react'
import { Calendar, CheckCircle2, Clock, Gift, Target } from 'lucide-react'
import { useChallengesStore, Challenge } from '@/stores/challengesStore'
import { cn } from '@/lib/utils'

export function WeeklyChallenges() {
  const [mounted, setMounted] = useState(false)
  const { activeChallenges, refreshWeeklyChallenges } = useChallengesStore()

  useEffect(() => {
    setMounted(true)
    refreshWeeklyChallenges()
  }, [refreshWeeklyChallenges])

  if (!mounted) {
    return null
  }

  const completedCount = activeChallenges.filter(c => c.completedAt).length
  const totalCount = activeChallenges.length

  // Calculate time remaining
  const getTimeRemaining = () => {
    if (activeChallenges.length === 0) return ''
    const expiresAt = new Date(activeChallenges[0].expiresAt)
    const now = new Date()
    const diff = expiresAt.getTime() - now.getTime()

    if (diff <= 0) return 'Terminé'

    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))

    if (days > 0) return `${days}j ${hours}h`
    return `${hours}h`
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary-500" />
          <h3 className="font-bold text-slate-900 dark:text-slate-100">Défis de la semaine</h3>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
          <Clock className="h-4 w-4" />
          <span>{getTimeRemaining()}</span>
        </div>
      </div>

      <div className="mb-4 flex items-center gap-2">
        <div className="flex-1">
          <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700">
            <div
              className="h-full rounded-full bg-gradient-to-r from-primary-500 to-primary-600 transition-all duration-500"
              style={{ width: `${totalCount > 0 ? (completedCount / totalCount) * 100 : 0}%` }}
            />
          </div>
        </div>
        <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
          {completedCount}/{totalCount}
        </span>
      </div>

      <div className="space-y-3">
        {activeChallenges.map(challenge => (
          <ChallengeCard key={challenge.id} challenge={challenge} />
        ))}
      </div>
    </div>
  )
}

function ChallengeCard({ challenge }: { challenge: Challenge }) {
  const progress = Math.min((challenge.current / challenge.target) * 100, 100)
  const isCompleted = !!challenge.completedAt

  const typeIcons = {
    lessons: '📖',
    exercises: '✏️',
    quizzes: '📝',
    streak: '🔥',
    points: '⭐',
  }

  return (
    <div
      className={cn(
        'rounded-lg border p-4 transition-all',
        isCompleted
          ? 'border-success-200 bg-success-50 dark:border-success-800 dark:bg-success-900/20'
          : 'border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/50'
      )}
    >
      <div className="flex items-start gap-3">
        <span className="text-xl">{typeIcons[challenge.type]}</span>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h4 className={cn(
              'font-medium',
              isCompleted ? 'text-success-700 dark:text-success-400' : 'text-slate-900 dark:text-slate-100'
            )}>
              {challenge.title}
            </h4>
            {isCompleted && (
              <CheckCircle2 className="h-4 w-4 text-success-500" />
            )}
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400">{challenge.description}</p>

          <div className="mt-2 flex items-center gap-3">
            <div className="flex-1">
              <div className="h-1.5 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                <div
                  className={cn(
                    'h-full rounded-full transition-all duration-500',
                    isCompleted ? 'bg-success-500' : 'bg-primary-500'
                  )}
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              {challenge.current}/{challenge.target}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1 rounded-full bg-amber-100 px-2 py-1 dark:bg-amber-900/30">
          <Gift className="h-3 w-3 text-amber-600 dark:text-amber-400" />
          <span className="text-xs font-semibold text-amber-700 dark:text-amber-300">
            +{challenge.reward}
          </span>
        </div>
      </div>
    </div>
  )
}

export function WeeklyChallengesMini() {
  const [mounted, setMounted] = useState(false)
  const { activeChallenges, refreshWeeklyChallenges } = useChallengesStore()

  useEffect(() => {
    setMounted(true)
    refreshWeeklyChallenges()
  }, [refreshWeeklyChallenges])

  if (!mounted) {
    return null
  }

  const completedCount = activeChallenges.filter(c => c.completedAt).length
  const totalCount = activeChallenges.length

  return (
    <div className="flex items-center gap-2">
      <Target className="h-4 w-4 text-primary-500" />
      <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
        {completedCount}/{totalCount} défis
      </span>
      <div className="h-1.5 w-20 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
        <div
          className="h-full rounded-full bg-primary-500 transition-all"
          style={{ width: `${totalCount > 0 ? (completedCount / totalCount) * 100 : 0}%` }}
        />
      </div>
    </div>
  )
}
