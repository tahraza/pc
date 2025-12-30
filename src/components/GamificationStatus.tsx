'use client'

import { useEffect, useState } from 'react'
import { Flame, Star, Trophy, Zap } from 'lucide-react'
import { useGamificationStore } from '@/stores/gamificationStore'
import { cn } from '@/lib/utils'

export function GamificationStatus() {
  const [mounted, setMounted] = useState(false)
  const { totalPoints, currentStreak, getLevel, unlockedBadges } = useGamificationStore()

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  const { level, currentXP, requiredXP, progress } = getLevel()

  return (
    <div className="flex items-center gap-4">
      {/* Level & XP */}
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-sm font-bold text-white shadow-md">
          {level}
        </div>
        <div className="hidden sm:block">
          <div className="text-xs font-medium text-slate-600 dark:text-slate-400">Niveau {level}</div>
          <div className="flex items-center gap-1">
            <div className="h-1.5 w-16 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
              <div
                className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-500 transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-xs text-slate-500 dark:text-slate-500">{currentXP}/{requiredXP}</span>
          </div>
        </div>
      </div>

      {/* Points */}
      <div className="flex items-center gap-1.5 rounded-lg bg-primary-50 px-2.5 py-1.5 dark:bg-primary-900/30">
        <Star className="h-4 w-4 text-primary-500" />
        <span className="text-sm font-semibold text-primary-700 dark:text-primary-300">{totalPoints}</span>
      </div>

      {/* Streak */}
      {currentStreak > 0 && (
        <div className="flex items-center gap-1.5 rounded-lg bg-orange-50 px-2.5 py-1.5 dark:bg-orange-900/30">
          <Flame className="h-4 w-4 text-orange-500" />
          <span className="text-sm font-semibold text-orange-700 dark:text-orange-300">{currentStreak}</span>
        </div>
      )}

      {/* Badges count */}
      <div className="flex items-center gap-1.5 rounded-lg bg-emerald-50 px-2.5 py-1.5 dark:bg-emerald-900/30">
        <Trophy className="h-4 w-4 text-emerald-500" />
        <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">{unlockedBadges.length}</span>
      </div>
    </div>
  )
}

export function GamificationStatusCompact() {
  const [mounted, setMounted] = useState(false)
  const { totalPoints, currentStreak, getLevel } = useGamificationStore()

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  const { level } = getLevel()

  return (
    <div className="flex items-center gap-2">
      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-xs font-bold text-white">
        {level}
      </div>
      <div className="flex items-center gap-1">
        <Star className="h-3.5 w-3.5 text-primary-500" />
        <span className="text-xs font-medium text-slate-600 dark:text-slate-400">{totalPoints}</span>
      </div>
      {currentStreak > 0 && (
        <div className="flex items-center gap-1">
          <Flame className="h-3.5 w-3.5 text-orange-500" />
          <span className="text-xs font-medium text-slate-600 dark:text-slate-400">{currentStreak}</span>
        </div>
      )}
    </div>
  )
}
