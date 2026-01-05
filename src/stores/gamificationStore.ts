import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { usePetStore } from './petStore'
import { useChallengesStore } from './challengesStore'

export interface Badge {
  id: string
  name: string
  description: string
  icon: string
  category: 'lessons' | 'exercises' | 'quizzes' | 'streaks' | 'special'
  requirement: number
  unlockedAt?: Date
}

export interface Achievement {
  id: string
  name: string
  description: string
  points: number
  earnedAt: Date
}

interface DailyActivity {
  date: string // YYYY-MM-DD
  lessonsCompleted: number
  exercisesCompleted: number
  quizzesCompleted: number
  pointsEarned: number
}

interface ProgressData {
  lessonProgress: Record<string, { status?: string; lessonId?: string }>
  exerciseProgress: Record<string, { status?: string; exerciseId?: string }>
  quizAttempts: Array<{ quizId: string; score: number; totalQuestions: number }>
}

interface GamificationState {
  // Points
  totalPoints: number
  pointsHistory: { date: string; points: number; reason: string }[]

  // Streaks
  currentStreak: number
  longestStreak: number
  lastActivityDate: string | null

  // Badges
  badges: Badge[]
  unlockedBadges: string[]

  // Achievements
  achievements: Achievement[]

  // Daily activity
  dailyActivities: DailyActivity[]

  // Stats
  totalLessonsCompleted: number
  totalExercisesCompleted: number
  totalQuizzesCompleted: number
  totalCorrectAnswers: number

  // Migration
  migrationVersion: number

  // Actions
  addPoints: (points: number, reason: string) => void
  recordLessonCompleted: (lessonId: string) => void
  recordExerciseCompleted: (exerciseId: string, isCorrect: boolean) => void
  recordQuizCompleted: (quizId: string, score: number, total: number, bonusPoints?: number) => void
  checkAndUnlockBadges: () => Badge[]
  updateStreak: () => void
  getLevel: () => { level: number; currentXP: number; requiredXP: number; progress: number }
  getTodayActivity: () => DailyActivity | null
  migrateFromProgressData: (data: ProgressData) => { migratedLessons: number; migratedExercises: number; migratedQuizzes: number; totalPoints: number }
}

// Point values
const POINTS = {
  LESSON_COMPLETED: 50,
  EXERCISE_CORRECT: 20,
  EXERCISE_ATTEMPT: 5,
  QUIZ_PERFECT: 100,
  QUIZ_GOOD: 50,
  QUIZ_COMPLETE: 25,
  STREAK_BONUS: 10, // Per day of streak
}

// Badge definitions
const BADGES: Badge[] = [
  // Lessons badges
  { id: 'first-lesson', name: 'Première Leçon', description: 'Compléter votre première leçon', icon: '📖', category: 'lessons', requirement: 1 },
  { id: 'lesson-5', name: 'Apprenti', description: 'Compléter 5 leçons', icon: '📚', category: 'lessons', requirement: 5 },
  { id: 'lesson-10', name: 'Studieux', description: 'Compléter 10 leçons', icon: '🎓', category: 'lessons', requirement: 10 },
  { id: 'lesson-all', name: 'Maître des Cours', description: 'Compléter toutes les leçons', icon: '🏆', category: 'lessons', requirement: 16 },

  // Exercise badges
  { id: 'first-exercise', name: 'Premier Exercice', description: 'Réussir votre premier exercice', icon: '✏️', category: 'exercises', requirement: 1 },
  { id: 'exercise-10', name: 'Persévérant', description: 'Réussir 10 exercices', icon: '💪', category: 'exercises', requirement: 10 },
  { id: 'exercise-25', name: 'Champion', description: 'Réussir 25 exercices', icon: '🌟', category: 'exercises', requirement: 25 },
  { id: 'exercise-50', name: 'Expert', description: 'Réussir 50 exercices', icon: '🎯', category: 'exercises', requirement: 50 },

  // Quiz badges
  { id: 'first-quiz', name: 'Premier QCM', description: 'Compléter votre premier QCM', icon: '📝', category: 'quizzes', requirement: 1 },
  { id: 'quiz-10', name: 'Testeur', description: 'Compléter 10 QCM', icon: '📋', category: 'quizzes', requirement: 10 },
  { id: 'quiz-perfect', name: 'Perfectionniste', description: 'Obtenir 100% à un QCM', icon: '💯', category: 'quizzes', requirement: 1 },

  // Streak badges
  { id: 'streak-3', name: 'En Route', description: 'Maintenir une série de 3 jours', icon: '🔥', category: 'streaks', requirement: 3 },
  { id: 'streak-7', name: 'Semaine Parfaite', description: 'Maintenir une série de 7 jours', icon: '⚡', category: 'streaks', requirement: 7 },
  { id: 'streak-14', name: 'Deux Semaines', description: 'Maintenir une série de 14 jours', icon: '🚀', category: 'streaks', requirement: 14 },
  { id: 'streak-30', name: 'Mois Légendaire', description: 'Maintenir une série de 30 jours', icon: '👑', category: 'streaks', requirement: 30 },

  // Special badges
  { id: 'early-bird', name: 'Lève-tôt', description: 'Étudier avant 8h du matin', icon: '🌅', category: 'special', requirement: 1 },
  { id: 'night-owl', name: 'Noctambule', description: 'Étudier après 22h', icon: '🦉', category: 'special', requirement: 1 },
  { id: 'points-500', name: 'Demi-millier', description: 'Atteindre 500 points', icon: '💎', category: 'special', requirement: 500 },
  { id: 'points-1000', name: 'Millionnaire', description: 'Atteindre 1000 points', icon: '💰', category: 'special', requirement: 1000 },
  { id: 'points-5000', name: 'Légende', description: 'Atteindre 5000 points', icon: '🏅', category: 'special', requirement: 5000 },
]

// XP required for each level (exponential growth)
const getRequiredXP = (level: number) => Math.floor(100 * Math.pow(1.5, level - 1))

const getTodayString = () => new Date().toISOString().split('T')[0]

export const useGamificationStore = create<GamificationState>()(
  persist(
    (set, get) => ({
      // Initial state
      totalPoints: 0,
      pointsHistory: [],
      currentStreak: 0,
      longestStreak: 0,
      lastActivityDate: null,
      badges: BADGES,
      unlockedBadges: [],
      achievements: [],
      dailyActivities: [],
      totalLessonsCompleted: 0,
      totalExercisesCompleted: 0,
      totalQuizzesCompleted: 0,
      totalCorrectAnswers: 0,
      migrationVersion: 0,

      addPoints: (points, reason) => {
        const today = getTodayString()
        set((state) => ({
          totalPoints: state.totalPoints + points,
          pointsHistory: [
            ...state.pointsHistory,
            { date: today, points, reason }
          ]
        }))

        // Update daily activity
        const state = get()
        const todayActivity = state.dailyActivities.find(a => a.date === today)
        if (todayActivity) {
          set((state) => ({
            dailyActivities: state.dailyActivities.map(a =>
              a.date === today ? { ...a, pointsEarned: a.pointsEarned + points } : a
            )
          }))
        } else {
          set((state) => ({
            dailyActivities: [
              ...state.dailyActivities,
              { date: today, lessonsCompleted: 0, exercisesCompleted: 0, quizzesCompleted: 0, pointsEarned: points }
            ]
          }))
        }

        // Add points to pet
        usePetStore.getState().addPetPoints(points)

        // Update challenges
        useChallengesStore.getState().updateChallengeProgress('points', points)

        // Check for point-based badges
        get().checkAndUnlockBadges()
      },

      recordLessonCompleted: (lessonId) => {
        const today = getTodayString()

        set((state) => ({
          totalLessonsCompleted: state.totalLessonsCompleted + 1
        }))

        get().addPoints(POINTS.LESSON_COMPLETED, `Leçon complétée`)
        get().updateStreak()

        // Update daily activity
        const state = get()
        const todayActivity = state.dailyActivities.find(a => a.date === today)
        if (todayActivity) {
          set((state) => ({
            dailyActivities: state.dailyActivities.map(a =>
              a.date === today ? { ...a, lessonsCompleted: a.lessonsCompleted + 1 } : a
            )
          }))
        }

        // Update challenges
        useChallengesStore.getState().updateChallengeProgress('lessons', 1)

        get().checkAndUnlockBadges()
      },

      recordExerciseCompleted: (exerciseId, isCorrect) => {
        const today = getTodayString()

        set((state) => ({
          totalExercisesCompleted: state.totalExercisesCompleted + 1,
          totalCorrectAnswers: isCorrect ? state.totalCorrectAnswers + 1 : state.totalCorrectAnswers
        }))

        const points = isCorrect ? POINTS.EXERCISE_CORRECT : POINTS.EXERCISE_ATTEMPT
        get().addPoints(points, isCorrect ? 'Exercice réussi' : 'Exercice tenté')
        get().updateStreak()

        // Update daily activity
        const state = get()
        const todayActivity = state.dailyActivities.find(a => a.date === today)
        if (todayActivity) {
          set((state) => ({
            dailyActivities: state.dailyActivities.map(a =>
              a.date === today ? { ...a, exercisesCompleted: a.exercisesCompleted + 1 } : a
            )
          }))
        }

        // Update challenges (only if correct)
        if (isCorrect) {
          useChallengesStore.getState().updateChallengeProgress('exercises', 1)
        }

        get().checkAndUnlockBadges()
      },

      recordQuizCompleted: (quizId, score, total, bonusPoints = 0) => {
        const today = getTodayString()
        const percentage = (score / total) * 100

        set((state) => ({
          totalQuizzesCompleted: state.totalQuizzesCompleted + 1,
          totalCorrectAnswers: state.totalCorrectAnswers + score
        }))

        let points = POINTS.QUIZ_COMPLETE
        let reason = 'QCM complété'

        if (percentage === 100) {
          points = POINTS.QUIZ_PERFECT
          reason = 'QCM parfait!'
        } else if (percentage >= 70) {
          points = POINTS.QUIZ_GOOD
          reason = 'Bon résultat au QCM'
        }

        // Ajouter les points bonus de difficulté
        const totalPoints = points + bonusPoints
        const finalReason = bonusPoints > 0 ? `${reason} (+${bonusPoints} bonus difficulté)` : reason

        get().addPoints(totalPoints, finalReason)
        get().updateStreak()

        // Update daily activity
        const state = get()
        const todayActivity = state.dailyActivities.find(a => a.date === today)
        if (todayActivity) {
          set((state) => ({
            dailyActivities: state.dailyActivities.map(a =>
              a.date === today ? { ...a, quizzesCompleted: a.quizzesCompleted + 1 } : a
            )
          }))
        }

        // Update challenges
        useChallengesStore.getState().updateChallengeProgress('quizzes', 1)

        get().checkAndUnlockBadges()
      },

      updateStreak: () => {
        const today = getTodayString()
        const state = get()
        const lastDate = state.lastActivityDate

        if (!lastDate) {
          // First activity
          set({ currentStreak: 1, lastActivityDate: today, longestStreak: Math.max(1, state.longestStreak) })
          // Update streak challenge
          useChallengesStore.getState().updateChallengeProgress('streak', 1)
        } else if (lastDate === today) {
          // Already counted today
          return
        } else {
          const lastDateObj = new Date(lastDate)
          const todayObj = new Date(today)
          const diffTime = todayObj.getTime() - lastDateObj.getTime()
          const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

          if (diffDays === 1) {
            // Consecutive day
            const newStreak = state.currentStreak + 1
            set({
              currentStreak: newStreak,
              lastActivityDate: today,
              longestStreak: Math.max(newStreak, state.longestStreak)
            })
            // Streak bonus
            get().addPoints(POINTS.STREAK_BONUS * newStreak, `Bonus série ${newStreak} jours`)
            // Update streak challenge with the new streak value
            useChallengesStore.getState().updateChallengeProgress('streak', 1)
          } else {
            // Streak broken
            set({ currentStreak: 1, lastActivityDate: today })
            // Reset streak challenge progress (start fresh)
            useChallengesStore.getState().updateChallengeProgress('streak', 1)
          }
        }

        get().checkAndUnlockBadges()
      },

      checkAndUnlockBadges: () => {
        const state = get()
        const newlyUnlocked: Badge[] = []

        state.badges.forEach(badge => {
          if (state.unlockedBadges.includes(badge.id)) return

          let shouldUnlock = false

          switch (badge.category) {
            case 'lessons':
              shouldUnlock = state.totalLessonsCompleted >= badge.requirement
              break
            case 'exercises':
              shouldUnlock = state.totalCorrectAnswers >= badge.requirement
              break
            case 'quizzes':
              if (badge.id === 'quiz-perfect') {
                // This is handled separately when a perfect quiz is achieved
                shouldUnlock = false
              } else {
                shouldUnlock = state.totalQuizzesCompleted >= badge.requirement
              }
              break
            case 'streaks':
              shouldUnlock = state.currentStreak >= badge.requirement || state.longestStreak >= badge.requirement
              break
            case 'special':
              if (badge.id.startsWith('points-')) {
                shouldUnlock = state.totalPoints >= badge.requirement
              } else if (badge.id === 'early-bird') {
                const hour = new Date().getHours()
                shouldUnlock = hour < 8
              } else if (badge.id === 'night-owl') {
                const hour = new Date().getHours()
                shouldUnlock = hour >= 22
              }
              break
          }

          if (shouldUnlock) {
            newlyUnlocked.push({ ...badge, unlockedAt: new Date() })
          }
        })

        if (newlyUnlocked.length > 0) {
          set((state) => ({
            unlockedBadges: [...state.unlockedBadges, ...newlyUnlocked.map(b => b.id)],
            badges: state.badges.map(b => {
              const unlocked = newlyUnlocked.find(u => u.id === b.id)
              return unlocked ? { ...b, unlockedAt: unlocked.unlockedAt } : b
            })
          }))
        }

        return newlyUnlocked
      },

      getLevel: () => {
        const { totalPoints } = get()
        let level = 1
        let accumulatedXP = 0

        while (accumulatedXP + getRequiredXP(level) <= totalPoints) {
          accumulatedXP += getRequiredXP(level)
          level++
        }

        const currentXP = totalPoints - accumulatedXP
        const requiredXP = getRequiredXP(level)
        const progress = (currentXP / requiredXP) * 100

        return { level, currentXP, requiredXP, progress }
      },

      getTodayActivity: () => {
        const today = getTodayString()
        return get().dailyActivities.find(a => a.date === today) || null
      },

      migrateFromProgressData: (data: ProgressData) => {
        const state = get()

        // Ne migrer que si pas encore fait (version 0)
        if (state.migrationVersion >= 1) {
          return { migratedLessons: 0, migratedExercises: 0, migratedQuizzes: 0, totalPoints: 0 }
        }

        let totalPointsAdded = 0
        let migratedLessons = 0
        let migratedExercises = 0
        let migratedQuizzes = 0
        const today = getTodayString()

        // Migrer les leçons maîtrisées
        Object.values(data.lessonProgress).forEach((progress) => {
          if (progress.status === 'mastered') {
            totalPointsAdded += POINTS.LESSON_COMPLETED
            migratedLessons++
          }
        })

        // Migrer les exercices complétés
        Object.values(data.exerciseProgress).forEach((progress) => {
          if (progress.status === 'completed') {
            totalPointsAdded += POINTS.EXERCISE_CORRECT
            migratedExercises++
          }
        })

        // Migrer les QCM
        data.quizAttempts.forEach((attempt) => {
          const percentage = (attempt.score / attempt.totalQuestions) * 100
          if (percentage === 100) {
            totalPointsAdded += POINTS.QUIZ_PERFECT
          } else if (percentage >= 70) {
            totalPointsAdded += POINTS.QUIZ_GOOD
          } else {
            totalPointsAdded += POINTS.QUIZ_COMPLETE
          }
          migratedQuizzes++
        })

        // Appliquer la migration si des points sont à ajouter
        if (totalPointsAdded > 0) {
          set((state) => ({
            totalPoints: state.totalPoints + totalPointsAdded,
            pointsHistory: [
              ...state.pointsHistory,
              { date: today, points: totalPointsAdded, reason: 'Migration rétroactive des points' }
            ],
            totalLessonsCompleted: state.totalLessonsCompleted + migratedLessons,
            totalExercisesCompleted: state.totalExercisesCompleted + migratedExercises,
            totalQuizzesCompleted: state.totalQuizzesCompleted + migratedQuizzes,
            totalCorrectAnswers: state.totalCorrectAnswers + migratedExercises,
            migrationVersion: 1,
          }))

          // Ajouter les points au pet
          usePetStore.getState().addPetPoints(totalPointsAdded)

          // Vérifier les badges
          get().checkAndUnlockBadges()
        } else {
          // Marquer comme migré même si aucun point à ajouter
          set({ migrationVersion: 1 })
        }

        return { migratedLessons, migratedExercises, migratedQuizzes, totalPoints: totalPointsAdded }
      },
    }),
    {
      name: 'physique-chimie-gamification',
    }
  )
)
