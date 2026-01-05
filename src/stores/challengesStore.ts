import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface Challenge {
  id: string
  title: string
  description: string
  type: 'lessons' | 'exercises' | 'quizzes' | 'streak' | 'points' | 'flashcards' | 'perfect_quiz'
  target: number
  current: number
  reward: number
  expiresAt: string // ISO date string
  completedAt?: string
  period: 'daily' | 'weekly' | 'monthly'
}

interface ChallengesState {
  // Daily challenges
  dailyChallenges: Challenge[]
  lastDailyRefresh: string | null

  // Weekly challenges
  activeChallenges: Challenge[]
  completedChallenges: Challenge[]
  lastRefresh: string | null

  // Monthly challenges
  monthlyChallenges: Challenge[]
  lastMonthlyRefresh: string | null

  // Actions
  refreshDailyChallenges: () => void
  refreshWeeklyChallenges: () => void
  refreshMonthlyChallenges: () => void
  updateChallengeProgress: (type: Challenge['type'], amount: number) => Challenge[]
  getChallengesByType: (type: Challenge['type']) => Challenge[]
  getAllActiveChallenges: () => Challenge[]
}

// Daily challenge templates
const DAILY_CHALLENGE_TEMPLATES = [
  {
    type: 'lessons' as const,
    templates: [
      { title: 'Lecture du jour', description: 'Lire 1 leçon aujourd\'hui', target: 1, reward: 30 },
      { title: 'Double lecture', description: 'Lire 2 leçons aujourd\'hui', target: 2, reward: 60 },
    ]
  },
  {
    type: 'exercises' as const,
    templates: [
      { title: 'Échauffement', description: 'Compléter 2 exercices aujourd\'hui', target: 2, reward: 25 },
      { title: 'Entraînement', description: 'Compléter 4 exercices aujourd\'hui', target: 4, reward: 50 },
      { title: 'Session intensive', description: 'Compléter 6 exercices aujourd\'hui', target: 6, reward: 80 },
    ]
  },
  {
    type: 'quizzes' as const,
    templates: [
      { title: 'Test rapide', description: 'Compléter 1 QCM aujourd\'hui', target: 1, reward: 30 },
      { title: 'Double test', description: 'Compléter 2 QCM aujourd\'hui', target: 2, reward: 60 },
    ]
  },
  {
    type: 'flashcards' as const,
    templates: [
      { title: 'Mémorisation', description: 'Réviser 5 flashcards aujourd\'hui', target: 5, reward: 25 },
      { title: 'Session mémoire', description: 'Réviser 10 flashcards aujourd\'hui', target: 10, reward: 50 },
      { title: 'Marathon mémoire', description: 'Réviser 20 flashcards aujourd\'hui', target: 20, reward: 100 },
    ]
  },
  {
    type: 'perfect_quiz' as const,
    templates: [
      { title: 'Perfectionniste', description: 'Obtenir 100% à un QCM', target: 1, reward: 75 },
    ]
  },
]

// Weekly challenge templates
const WEEKLY_CHALLENGE_TEMPLATES = [
  {
    type: 'lessons' as const,
    templates: [
      { title: 'Rat de bibliothèque', description: 'Compléter 3 leçons cette semaine', target: 3, reward: 100 },
      { title: 'Assidu', description: 'Compléter 5 leçons cette semaine', target: 5, reward: 200 },
      { title: 'Boulimique', description: 'Compléter 8 leçons cette semaine', target: 8, reward: 350 },
    ]
  },
  {
    type: 'exercises' as const,
    templates: [
      { title: 'Entraînement léger', description: 'Réussir 5 exercices cette semaine', target: 5, reward: 75 },
      { title: 'Sportif', description: 'Réussir 10 exercices cette semaine', target: 10, reward: 150 },
      { title: 'Athlète', description: 'Réussir 20 exercices cette semaine', target: 20, reward: 300 },
    ]
  },
  {
    type: 'quizzes' as const,
    templates: [
      { title: 'Testeur', description: 'Compléter 3 QCM cette semaine', target: 3, reward: 80 },
      { title: 'Évaluateur', description: 'Compléter 5 QCM cette semaine', target: 5, reward: 150 },
      { title: 'Expert QCM', description: 'Compléter 8 QCM cette semaine', target: 8, reward: 280 },
    ]
  },
  {
    type: 'streak' as const,
    templates: [
      { title: 'Régularité', description: 'Maintenir une série de 3 jours', target: 3, reward: 100 },
      { title: 'Constance', description: 'Maintenir une série de 5 jours', target: 5, reward: 200 },
      { title: 'Persévérance', description: 'Maintenir une série de 7 jours', target: 7, reward: 400 },
    ]
  },
  {
    type: 'points' as const,
    templates: [
      { title: 'Collecteur', description: 'Gagner 200 points cette semaine', target: 200, reward: 50 },
      { title: 'Accumulateur', description: 'Gagner 500 points cette semaine', target: 500, reward: 125 },
      { title: 'Trésorier', description: 'Gagner 1000 points cette semaine', target: 1000, reward: 250 },
    ]
  },
]

// Monthly challenge templates
const MONTHLY_CHALLENGE_TEMPLATES = [
  {
    type: 'lessons' as const,
    templates: [
      { title: 'Érudit', description: 'Maîtriser 10 leçons ce mois', target: 10, reward: 500 },
      { title: 'Savant', description: 'Maîtriser toutes les leçons', target: 16, reward: 1000 },
    ]
  },
  {
    type: 'exercises' as const,
    templates: [
      { title: 'Marathonien', description: 'Compléter 50 exercices ce mois', target: 50, reward: 400 },
      { title: 'Ultramarathonien', description: 'Compléter 100 exercices ce mois', target: 100, reward: 800 },
    ]
  },
  {
    type: 'streak' as const,
    templates: [
      { title: 'Mois parfait', description: 'Série de 30 jours consécutifs', target: 30, reward: 1000 },
      { title: 'Deux semaines', description: 'Série de 14 jours consécutifs', target: 14, reward: 400 },
    ]
  },
  {
    type: 'points' as const,
    templates: [
      { title: 'Millionnaire', description: 'Gagner 2000 points ce mois', target: 2000, reward: 500 },
      { title: 'Magnat', description: 'Gagner 5000 points ce mois', target: 5000, reward: 1250 },
    ]
  },
]

// Date helpers
function getTodayStart(): string {
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  return now.toISOString()
}

function getTodayEnd(): string {
  const now = new Date()
  now.setHours(23, 59, 59, 999)
  return now.toISOString()
}

function getWeekEnd(): string {
  const now = new Date()
  const dayOfWeek = now.getDay()
  const daysUntilSunday = dayOfWeek === 0 ? 0 : 7 - dayOfWeek
  const endOfWeek = new Date(now)
  endOfWeek.setDate(now.getDate() + daysUntilSunday)
  endOfWeek.setHours(23, 59, 59, 999)
  return endOfWeek.toISOString()
}

function getWeekStart(): string {
  const now = new Date()
  const dayOfWeek = now.getDay()
  const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1
  const startOfWeek = new Date(now)
  startOfWeek.setDate(now.getDate() - daysFromMonday)
  startOfWeek.setHours(0, 0, 0, 0)
  return startOfWeek.toISOString()
}

function getMonthStart(): string {
  const now = new Date()
  now.setDate(1)
  now.setHours(0, 0, 0, 0)
  return now.toISOString()
}

function getMonthEnd(): string {
  const now = new Date()
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)
  nextMonth.setHours(23, 59, 59, 999)
  return nextMonth.toISOString()
}

// Shuffle array and pick n elements
function pickRandom<T>(array: T[], n: number): T[] {
  const shuffled = [...array].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, n)
}

// Generate daily challenges (3 random challenges)
function generateDailyChallenges(): Challenge[] {
  const expiresAt = getTodayEnd()
  const allTemplates: { type: Challenge['type']; template: { title: string; description: string; target: number; reward: number } }[] = []

  DAILY_CHALLENGE_TEMPLATES.forEach(category => {
    category.templates.forEach(template => {
      allTemplates.push({ type: category.type, template })
    })
  })

  const selected = pickRandom(allTemplates, 3)

  return selected.map(({ type, template }) => ({
    id: `daily-${type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type,
    ...template,
    current: 0,
    expiresAt,
    period: 'daily' as const,
  }))
}

// Generate weekly challenges (5 challenges, one per type)
function generateWeeklyChallenges(): Challenge[] {
  const expiresAt = getWeekEnd()
  const challenges: Challenge[] = []

  WEEKLY_CHALLENGE_TEMPLATES.forEach(category => {
    const randomTemplate = category.templates[Math.floor(Math.random() * category.templates.length)]
    challenges.push({
      id: `weekly-${category.type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: category.type,
      ...randomTemplate,
      current: 0,
      expiresAt,
      period: 'weekly' as const,
    })
  })

  return challenges
}

// Generate monthly challenges (2 random challenges)
function generateMonthlyChallenges(): Challenge[] {
  const expiresAt = getMonthEnd()
  const allTemplates: { type: Challenge['type']; template: { title: string; description: string; target: number; reward: number } }[] = []

  MONTHLY_CHALLENGE_TEMPLATES.forEach(category => {
    category.templates.forEach(template => {
      allTemplates.push({ type: category.type, template })
    })
  })

  const selected = pickRandom(allTemplates, 2)

  return selected.map(({ type, template }) => ({
    id: `monthly-${type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type,
    ...template,
    current: 0,
    expiresAt,
    period: 'monthly' as const,
  }))
}

export const useChallengesStore = create<ChallengesState>()(
  persist(
    (set, get) => ({
      // Initial state
      dailyChallenges: [],
      lastDailyRefresh: null,
      activeChallenges: [],
      completedChallenges: [],
      lastRefresh: null,
      monthlyChallenges: [],
      lastMonthlyRefresh: null,

      refreshDailyChallenges: () => {
        const state = get()
        const todayStart = getTodayStart()

        // Check if we need to refresh (new day or first time)
        if (!state.lastDailyRefresh || state.lastDailyRefresh < todayStart) {
          // Archive expired daily challenges
          const now = new Date().toISOString()
          const expired = state.dailyChallenges.filter(c => c.expiresAt < now)

          const newChallenges = generateDailyChallenges()

          set({
            dailyChallenges: newChallenges,
            completedChallenges: [...state.completedChallenges, ...expired],
            lastDailyRefresh: todayStart,
          })
        }
      },

      refreshWeeklyChallenges: () => {
        const state = get()
        const weekStart = getWeekStart()

        // Check if we need to refresh (new week or first time)
        if (!state.lastRefresh || state.lastRefresh < weekStart) {
          // Move expired challenges to completed (even if not finished)
          const now = new Date().toISOString()
          const expired = state.activeChallenges.filter(c => c.expiresAt < now)

          const newChallenges = generateWeeklyChallenges()

          set({
            activeChallenges: newChallenges,
            completedChallenges: [...state.completedChallenges, ...expired],
            lastRefresh: weekStart,
          })
        }
      },

      refreshMonthlyChallenges: () => {
        const state = get()
        const monthStart = getMonthStart()

        // Check if we need to refresh (new month or first time)
        if (!state.lastMonthlyRefresh || state.lastMonthlyRefresh < monthStart) {
          const now = new Date().toISOString()
          const expired = state.monthlyChallenges.filter(c => c.expiresAt < now)

          const newChallenges = generateMonthlyChallenges()

          set({
            monthlyChallenges: newChallenges,
            completedChallenges: [...state.completedChallenges, ...expired],
            lastMonthlyRefresh: monthStart,
          })
        }
      },

      updateChallengeProgress: (type, amount) => {
        const state = get()
        const completedThisUpdate: Challenge[] = []

        // Helper to update challenges in a list
        const updateList = (challenges: Challenge[]): Challenge[] => {
          return challenges.map(challenge => {
            if (challenge.type === type && !challenge.completedAt) {
              const newCurrent = challenge.current + amount
              const isCompleted = newCurrent >= challenge.target

              if (isCompleted && !challenge.completedAt) {
                completedThisUpdate.push({ ...challenge, current: newCurrent, completedAt: new Date().toISOString() })
              }

              return {
                ...challenge,
                current: newCurrent,
                completedAt: isCompleted ? new Date().toISOString() : undefined,
              }
            }
            return challenge
          })
        }

        set({
          dailyChallenges: updateList(state.dailyChallenges),
          activeChallenges: updateList(state.activeChallenges),
          monthlyChallenges: updateList(state.monthlyChallenges),
        })

        return completedThisUpdate
      },

      getChallengesByType: (type) => {
        const state = get()
        return [
          ...state.dailyChallenges,
          ...state.activeChallenges,
          ...state.monthlyChallenges,
        ].filter(c => c.type === type)
      },

      getAllActiveChallenges: () => {
        const state = get()
        return [
          ...state.dailyChallenges,
          ...state.activeChallenges,
          ...state.monthlyChallenges,
        ].filter(c => !c.completedAt)
      },
    }),
    {
      name: 'physique-chimie-challenges',
    }
  )
)
