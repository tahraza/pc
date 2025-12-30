'use client'

import { useStore } from '@/store/useStore'
import { CheckCircle, Circle, RefreshCw, Eye } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { MasteryStatus } from '@/types'

interface LessonProgressProps {
  lessonId: string
}

const statusConfig: Record<MasteryStatus, { label: string; icon: typeof CheckCircle; color: string }> = {
  not_started: { label: 'Non commencée', icon: Circle, color: 'text-slate-400' },
  in_progress: { label: 'En cours', icon: Eye, color: 'text-primary-600' },
  mastered: { label: 'Maîtrisée', icon: CheckCircle, color: 'text-success-600' },
  to_review: { label: 'À revoir', icon: RefreshCw, color: 'text-warning-600' },
}

export function LessonProgress({ lessonId }: LessonProgressProps) {
  const { lessonProgress, markLessonStatus } = useStore()
  const progress = lessonProgress[lessonId]
  const currentStatus: MasteryStatus = progress?.status || 'not_started'

  const handleStatusChange = (status: MasteryStatus) => {
    markLessonStatus(lessonId, status)
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        {Object.entries(statusConfig).map(([status, config]) => {
          const Icon = config.icon
          const isActive = currentStatus === status

          return (
            <button
              key={status}
              onClick={() => handleStatusChange(status as MasteryStatus)}
              className={cn(
                'flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-all',
                isActive
                  ? `${config.color} bg-opacity-10 ring-2 ring-current`
                  : 'text-slate-500 hover:bg-slate-100'
              )}
              title={config.label}
            >
              <Icon className="h-4 w-4" />
              <span className="hidden sm:inline">{config.label}</span>
            </button>
          )
        })}
      </div>

      {progress?.preQuizScore !== undefined && (
        <div className="text-sm text-slate-500">
          Score QCM diagnostic : <span className="font-medium">{progress.preQuizScore}%</span>
        </div>
      )}

      {progress?.postQuizScore !== undefined && (
        <div className="text-sm text-slate-500">
          Score QCM validation : <span className="font-medium">{progress.postQuizScore}%</span>
        </div>
      )}
    </div>
  )
}
