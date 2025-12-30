import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface Challenge {
  id: string
  title: string
  description: string
  type: 'lessons' | 'exercises' | 'quizzes' | 'streak' | 'points'
  target: number
  current: number
  reward: number
  expiresAt: string // ISO date string
  completedAt?: string
}

interface ChallengesState {
  activeChallenges: Challenge[]
  completedChallenges: Challenge[]
  lastRefresh: string | null

  // Actions
  refreshWeeklyChallenges: () => void
  updateChallengeProgress: (type: Challenge['type'], amount: number) => Challenge[]
  getChallengesByType: (type: Challenge['type']) => Challenge[]
}

// Challenge templates
const CHALLENGE_TEMPLATES = [
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

function generateWeeklyChallenges(): Challenge[] {
  const expiresAt = getWeekEnd()
  const challenges: Challenge[] = []

  // Pick one random challenge from each type
  CHALLENGE_TEMPLATES.forEach(category => {
    const randomTemplate = category.templates[Math.floor(Math.random() * category.templates.length)]
    challenges.push({
      id: `${category.type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: category.type,
      ...randomTemplate,
      current: 0,
      expiresAt,
    })
  })

  return challenges
}

export const useChallengesStore = create<ChallengesState>()(
  persist(
    (set, get) => ({
      activeChallenges: [],
      completedChallenges: [],
      lastRefresh: null,

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

      updateChallengeProgress: (type, amount) => {
        const state = get()
        const completedThisUpdate: Challenge[] = []

        const updatedChallenges = state.activeChallenges.map(challenge => {
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

        set({ activeChallenges: updatedChallenges })

        return completedThisUpdate
      },

      getChallengesByType: (type) => {
        return get().activeChallenges.filter(c => c.type === type)
      },
    }),
    {
      name: 'physique-chimie-challenges',
    }
  )
)
