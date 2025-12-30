'use client'

import { useStore } from '@/store/useStore'
import { Calendar, Check, Clock } from 'lucide-react'
import { cn, formatDate, getRevisionSchedule } from '@/lib/utils'

interface RevisionScheduleProps {
  lessonId: string
}

export function RevisionSchedule({ lessonId }: RevisionScheduleProps) {
  const { lessonProgress, completeLessonRevision } = useStore()
  const progress = lessonProgress[lessonId]

  const scheduleItems = getRevisionSchedule()

  // If lesson not started or not mastered, show the schedule template
  if (!progress || progress.status !== 'mastered') {
    return (
      <div className="card">
        <h3 className="flex items-center gap-2 font-semibold text-slate-900">
          <Calendar className="h-5 w-5 text-primary-600" />
          Planning de révision
        </h3>
        <p className="mt-2 text-sm text-slate-600">
          Marque cette leçon comme "Maîtrisée" pour activer le planning de révision espacée.
        </p>
        <div className="mt-4 space-y-2">
          {scheduleItems.map((item) => (
            <div
              key={item.days}
              className="flex items-center gap-3 text-sm text-slate-400"
            >
              <div className="h-6 w-6 rounded-full border-2 border-slate-200" />
              <span>{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Show actual schedule
  const schedule = progress.revisionSchedule || []

  return (
    <div className="card">
      <h3 className="flex items-center gap-2 font-semibold text-slate-900">
        <Calendar className="h-5 w-5 text-primary-600" />
        Planning de révision
      </h3>
      <p className="mt-2 text-sm text-slate-600">
        Coche les révisions effectuées pour ancrer les connaissances.
      </p>
      <div className="mt-4 space-y-2">
        {schedule.map((item) => {
          const scheduleLabel = scheduleItems.find((s) => s.days === item.dayOffset)?.label || `J+${item.dayOffset}`
          const dueDate = new Date(item.scheduledDate)
          const isOverdue = !item.completed && dueDate < new Date()
          const isDue = !item.completed && dueDate.toDateString() === new Date().toDateString()

          return (
            <button
              key={item.dayOffset}
              onClick={() => !item.completed && completeLessonRevision(lessonId, item.dayOffset)}
              disabled={item.completed}
              className={cn(
                'flex w-full items-center gap-3 rounded-lg p-2 text-left transition-colors',
                item.completed
                  ? 'bg-success-50 text-success-700'
                  : isDue
                  ? 'bg-primary-50 text-primary-700 hover:bg-primary-100'
                  : isOverdue
                  ? 'bg-danger-50 text-danger-700 hover:bg-danger-100'
                  : 'hover:bg-slate-50'
              )}
            >
              <div
                className={cn(
                  'flex h-6 w-6 items-center justify-center rounded-full border-2 transition-colors',
                  item.completed
                    ? 'border-success-500 bg-success-500 text-white'
                    : isDue
                    ? 'border-primary-500'
                    : isOverdue
                    ? 'border-danger-500'
                    : 'border-slate-300'
                )}
              >
                {item.completed && <Check className="h-4 w-4" />}
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium">{scheduleLabel}</div>
                <div className="text-xs opacity-75">
                  {item.completed
                    ? `Fait le ${formatDate(item.completedAt!)}`
                    : formatDate(item.scheduledDate)}
                </div>
              </div>
              {isDue && !item.completed && (
                <span className="badge badge-primary text-xs">Aujourd'hui</span>
              )}
              {isOverdue && !item.completed && (
                <span className="badge badge-danger text-xs">En retard</span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
