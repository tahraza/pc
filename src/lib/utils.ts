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

// ==========================================
// Système de décroissance de maîtrise
// ==========================================

export interface MasteryLevel {
  percentage: number // 0-100
  status: 'excellent' | 'good' | 'warning' | 'critical' | 'forgotten'
  label: string
  color: string
  bgColor: string
  daysUntilNextLevel: number | null
  needsReview: boolean
}

/**
 * Calcule le niveau de maîtrise basé sur la courbe de l'oubli
 * La maîtrise décroît exponentiellement avec le temps
 */
export function calculateMasteryLevel(
  masteredAt: string | undefined,
  lastReviewedAt: string | undefined
): MasteryLevel {
  // Si jamais maîtrisé, retourne 0%
  if (!masteredAt) {
    return {
      percentage: 0,
      status: 'forgotten',
      label: 'Non maîtrisé',
      color: 'text-slate-500',
      bgColor: 'bg-slate-200',
      daysUntilNextLevel: null,
      needsReview: false,
    }
  }

  const referenceDate = lastReviewedAt || masteredAt
  const daysSinceReview = Math.floor(
    (Date.now() - new Date(referenceDate).getTime()) / (1000 * 60 * 60 * 24)
  )

  // Courbe de l'oubli (Ebbinghaus) simplifiée
  // Rétention = 100 * e^(-t/S) où S est la force du souvenir
  // Simplifié : on définit des seuils
  let percentage: number
  let status: MasteryLevel['status']
  let label: string
  let color: string
  let bgColor: string
  let daysUntilNextLevel: number | null = null
  let needsReview = false

  if (daysSinceReview <= 1) {
    percentage = 100
    status = 'excellent'
    label = 'Fraîchement maîtrisé'
    color = 'text-success-600'
    bgColor = 'bg-success-500'
    daysUntilNextLevel = 2 - daysSinceReview
  } else if (daysSinceReview <= 7) {
    percentage = Math.round(100 - (daysSinceReview - 1) * 3) // 97% → 82%
    status = 'excellent'
    label = 'Excellent'
    color = 'text-success-600'
    bgColor = 'bg-success-500'
    daysUntilNextLevel = 8 - daysSinceReview
  } else if (daysSinceReview <= 14) {
    percentage = Math.round(82 - (daysSinceReview - 7) * 3) // 79% → 61%
    status = 'good'
    label = 'Bon'
    color = 'text-emerald-600'
    bgColor = 'bg-emerald-500'
    daysUntilNextLevel = 15 - daysSinceReview
    needsReview = daysSinceReview >= 10
  } else if (daysSinceReview <= 30) {
    percentage = Math.round(61 - (daysSinceReview - 14) * 1.3) // 60% → 40%
    status = 'warning'
    label = 'À réviser'
    color = 'text-warning-600'
    bgColor = 'bg-warning-500'
    daysUntilNextLevel = 31 - daysSinceReview
    needsReview = true
  } else if (daysSinceReview <= 60) {
    percentage = Math.round(40 - (daysSinceReview - 30) * 0.7) // 39% → 19%
    status = 'critical'
    label = 'Révision urgente'
    color = 'text-orange-600'
    bgColor = 'bg-orange-500'
    daysUntilNextLevel = 61 - daysSinceReview
    needsReview = true
  } else {
    percentage = Math.max(5, Math.round(19 - (daysSinceReview - 60) * 0.2)) // 18% → 5%
    status = 'forgotten'
    label = 'Oublié'
    color = 'text-danger-600'
    bgColor = 'bg-danger-500'
    daysUntilNextLevel = null
    needsReview = true
  }

  return {
    percentage: Math.max(0, Math.min(100, percentage)),
    status,
    label,
    color,
    bgColor,
    daysUntilNextLevel,
    needsReview,
  }
}

/**
 * Retourne le temps écoulé depuis une date en format lisible
 */
export function getTimeSince(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return "Aujourd'hui"
  if (diffDays === 1) return 'Hier'
  if (diffDays < 7) return `Il y a ${diffDays} jours`
  if (diffDays < 14) return 'Il y a 1 semaine'
  if (diffDays < 30) return `Il y a ${Math.floor(diffDays / 7)} semaines`
  if (diffDays < 60) return 'Il y a 1 mois'
  return `Il y a ${Math.floor(diffDays / 30)} mois`
}
