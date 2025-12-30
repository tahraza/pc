import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} min`
  }
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  if (mins === 0) {
    return `${hours}h`
  }
  return `${hours}h${mins}`
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1)
}

export function getDifficultyLabel(level: number): string {
  const labels: Record<number, string> = {
    1: 'Facile',
    2: 'Accessible',
    3: 'Intermédiaire',
    4: 'Avancé',
    5: 'Expert',
  }
  return labels[level] || 'Inconnu'
}

export function getDifficultyColor(level: number): string {
  const colors: Record<number, string> = {
    1: 'text-success-600 bg-success-100',
    2: 'text-emerald-600 bg-emerald-100',
    3: 'text-warning-600 bg-warning-100',
    4: 'text-orange-600 bg-orange-100',
    5: 'text-danger-600 bg-danger-100',
  }
  return colors[level] || 'text-slate-600 bg-slate-100'
}

export function getTrackLabel(track: string): string {
  const labels: Record<string, string> = {
    physique: 'Physique',
    chimie: 'Chimie',
  }
  return labels[track] || track
}

export function getTrackColor(track: string): string {
  const colors: Record<string, string> = {
    physique: 'text-primary-700 bg-primary-100',
    chimie: 'text-emerald-700 bg-emerald-100',
  }
  return colors[track] || 'text-slate-600 bg-slate-100'
}

export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

export function calculateSpacedRepetitionDate(
  lastReview: Date,
  repetitionCount: number,
  easeFactor: number = 2.5
): Date {
  // SM-2 algorithm simplified
  const intervals = [1, 3, 7, 14, 30, 60, 120]
  const baseInterval = intervals[Math.min(repetitionCount, intervals.length - 1)]
  const adjustedInterval = Math.round(baseInterval * easeFactor)

  const nextDate = new Date(lastReview)
  nextDate.setDate(nextDate.getDate() + adjustedInterval)
  return nextDate
}

export function isReviewDue(nextReviewDate: Date | string): boolean {
  const reviewDate = typeof nextReviewDate === 'string' ? new Date(nextReviewDate) : nextReviewDate
  return reviewDate <= new Date()
}

export function getRevisionSchedule(): { label: string; days: number }[] {
  return [
    { label: 'J+1', days: 1 },
    { label: 'J+3', days: 3 },
    { label: 'J+10', days: 10 },
    { label: 'J+30', days: 30 },
    { label: 'J+90', days: 90 },
  ]
}
