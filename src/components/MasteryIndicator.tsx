'use client'

import { useMemo } from 'react'
import { AlertTriangle, CheckCircle, Clock, RefreshCw } from 'lucide-react'
import { calculateMasteryLevel, getTimeSince, cn } from '@/lib/utils'
import type { LessonProgress } from '@/types'

interface MasteryIndicatorProps {
  progress: LessonProgress | undefined
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
  showPercentage?: boolean
  className?: string
}

export function MasteryIndicator({
  progress,
  size = 'md',
  showLabel = true,
  showPercentage = true,
  className,
}: MasteryIndicatorProps) {
  const mastery = useMemo(() => {
    if (!progress || progress.status !== 'mastered') {
      return null
    }
    return calculateMasteryLevel(progress.masteredAt, progress.lastReviewedAt)
  }, [progress])

  if (!mastery || !progress || progress.status !== 'mastered') {
    return null
  }

  const sizeClasses = {
    sm: 'h-1.5',
    md: 'h-2',
    lg: 'h-3',
  }

  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  }

  const textSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  }

  return (
    <div className={cn('space-y-1', className)}>
      {/* Progress bar */}
      <div className={cn('w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700', sizeClasses[size])}>
        <div
          className={cn('h-full rounded-full transition-all duration-500', mastery.bgColor)}
          style={{ width: `${mastery.percentage}%` }}
        />
      </div>

      {/* Label and info */}
      {(showLabel || showPercentage) && (
        <div className={cn('flex items-center justify-between', textSizes[size])}>
          {showLabel && (
            <span className={cn('flex items-center gap-1', mastery.color)}>
              {mastery.status === 'excellent' && <CheckCircle className={iconSizes[size]} />}
              {mastery.status === 'good' && <CheckCircle className={iconSizes[size]} />}
              {mastery.status === 'warning' && <Clock className={iconSizes[size]} />}
              {mastery.status === 'critical' && <AlertTriangle className={iconSizes[size]} />}
              {mastery.status === 'forgotten' && <RefreshCw className={iconSizes[size]} />}
              {mastery.label}
            </span>
          )}
          {showPercentage && (
            <span className="font-medium text-slate-600 dark:text-slate-400">
              {mastery.percentage}%
            </span>
          )}
        </div>
      )}
    </div>
  )
}

interface MasteryBadgeProps {
  progress: LessonProgress | undefined
  className?: string
}

export function MasteryBadge({ progress, className }: MasteryBadgeProps) {
  const mastery = useMemo(() => {
    if (!progress || progress.status !== 'mastered') {
      return null
    }
    return calculateMasteryLevel(progress.masteredAt, progress.lastReviewedAt)
  }, [progress])

  if (!mastery || !progress || progress.status !== 'mastered') {
    return null
  }

  const bgColors = {
    excellent: 'bg-success-100 text-success-700 dark:bg-success-900/30 dark:text-success-300',
    good: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
    warning: 'bg-warning-100 text-warning-700 dark:bg-warning-900/30 dark:text-warning-300',
    critical: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
    forgotten: 'bg-danger-100 text-danger-700 dark:bg-danger-900/30 dark:text-danger-300',
  }

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium',
        bgColors[mastery.status],
        className
      )}
    >
      {mastery.percentage}%
      {mastery.needsReview && (
        <RefreshCw className="h-3 w-3 animate-pulse" />
      )}
    </span>
  )
}

interface MasteryCardProps {
  progress: LessonProgress | undefined
  lessonTitle: string
  onReview?: () => void
  className?: string
}

export function MasteryCard({ progress, lessonTitle, onReview, className }: MasteryCardProps) {
  const mastery = useMemo(() => {
    if (!progress || progress.status !== 'mastered') {
      return null
    }
    return calculateMasteryLevel(progress.masteredAt, progress.lastReviewedAt)
  }, [progress])

  if (!mastery || !progress || progress.status !== 'mastered') {
    return null
  }

  const lastReviewed = progress.lastReviewedAt || progress.masteredAt

  return (
    <div
      className={cn(
        'rounded-lg border p-4',
        mastery.needsReview
          ? 'border-warning-200 bg-warning-50 dark:border-warning-800 dark:bg-warning-900/20'
          : 'border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800',
        className
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <h4 className="font-medium text-slate-900 dark:text-slate-100">
            {lessonTitle}
          </h4>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Dernière révision : {lastReviewed ? getTimeSince(lastReviewed) : 'Jamais'}
          </p>
          <MasteryIndicator progress={progress} size="sm" className="mt-2" />
        </div>

        {mastery.needsReview && onReview && (
          <button
            onClick={onReview}
            className="flex items-center gap-1 rounded-lg bg-primary-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-primary-700"
          >
            <RefreshCw className="h-4 w-4" />
            Réviser
          </button>
        )}
      </div>
    </div>
  )
}
