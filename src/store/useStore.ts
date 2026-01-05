'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type {
  AppState,
  LessonProgress,
  ExerciseProgress,
  FlashcardProgress,
  QuizAttempt,
  RevisionSession,
  UserPath,
  UserStats,
  DailyActivity,
  UserPreferences,
  MasteryStatus,
  FlashcardResponse,
  RevisionScheduleItem,
} from '@/types'
import { calculateSpacedRepetitionDate, getRevisionSchedule } from '@/lib/utils'

// Valeurs par défaut
const defaultStats: UserStats = {
  totalLessonsCompleted: 0,
  totalExercisesCompleted: 0,
  totalFlashcardsReviewed: 0,
  totalQuizzesTaken: 0,
  averageQuizScore: 0,
  currentStreak: 0,
  longestStreak: 0,
  lastActivityDate: '',
  totalStudyTime: 0,
  weakTopics: [],
  strongTopics: [],
}

const defaultPreferences: UserPreferences = {
  defaultTrack: undefined,
  dailyGoalMinutes: 30,
  notificationsEnabled: false,
  darkMode: false,
  showCompletedLessons: true,
}

interface StoreActions {
  // Leçons
  updateLessonProgress: (lessonId: string, progress: Partial<LessonProgress>) => void
  markLessonStatus: (lessonId: string, status: MasteryStatus) => void
  completeLessonRevision: (lessonId: string, dayOffset: number) => void

  // Exercices
  updateExerciseProgress: (exerciseId: string, progress: Partial<ExerciseProgress>) => void
  markExerciseCompleted: (exerciseId: string, lessonId: string) => void
  useExerciseHint: (exerciseId: string) => void
  viewExerciseSolution: (exerciseId: string) => void

  // Flashcards
  updateFlashcardProgress: (flashcardId: string, progress: Partial<FlashcardProgress>) => void
  reviewFlashcard: (flashcardId: string, lessonId: string, response: FlashcardResponse) => void
  getFlashcardsDueForReview: () => string[]

  // QCM
  addQuizAttempt: (attempt: QuizAttempt) => void
  getQuizAttempts: (lessonId: string) => QuizAttempt[]

  // Sessions
  startRevisionSession: (type: 'short' | 'long') => string
  completeRevisionSession: (sessionId: string, flashcards: string[], exercises: string[], score: number) => void

  // Parcours
  startPath: (pathId: string) => void
  updatePathProgress: (day: number) => void
  clearActivePath: () => void

  // Statistiques
  updateStats: (partial: Partial<UserStats>) => void
  incrementStreak: () => void
  resetStreak: () => void
  recordStudyTime: (minutes: number) => void

  // Activité quotidienne
  recordActivity: (type: 'lesson' | 'exercise' | 'flashcard' | 'quiz', id: string) => void
  getTodayActivity: () => DailyActivity | undefined

  // Préférences
  updatePreferences: (preferences: Partial<UserPreferences>) => void

  // Utilitaires
  resetAllProgress: () => void
  exportData: () => AppState
  importData: (data: AppState) => void
}

type Store = AppState & StoreActions

const getToday = () => new Date().toISOString().split('T')[0]

export const useStore = create<Store>()(
  persist(
    (set, get) => ({
      // État initial
      lessonProgress: {},
      exerciseProgress: {},
      flashcardProgress: {},
      quizAttempts: [],
      revisionSessions: [],
      activePath: undefined,
      stats: defaultStats,
      dailyActivities: {},
      preferences: defaultPreferences,

      // === LEÇONS ===
      updateLessonProgress: (lessonId, progress) => {
        set((state) => ({
          lessonProgress: {
            ...state.lessonProgress,
            [lessonId]: {
              ...state.lessonProgress[lessonId],
              lessonId,
              lastViewedAt: new Date().toISOString(),
              ...progress,
            },
          },
        }))
        get().recordActivity('lesson', lessonId)
      },

      markLessonStatus: (lessonId, status) => {
        const now = new Date()
        const schedule = getRevisionSchedule()

        // Créer le planning de révision si la leçon est marquée comme maîtrisée
        const revisionSchedule: RevisionScheduleItem[] =
          status === 'mastered'
            ? schedule.map((s) => {
                const scheduledDate = new Date(now)
                scheduledDate.setDate(scheduledDate.getDate() + s.days)
                return {
                  dayOffset: s.days,
                  scheduledDate: scheduledDate.toISOString(),
                  completed: false,
                }
              })
            : get().lessonProgress[lessonId]?.revisionSchedule || []

        set((state) => {
          const wasCompleted = state.lessonProgress[lessonId]?.status === 'mastered'
          const isNowCompleted = status === 'mastered'
          const existingProgress = state.lessonProgress[lessonId]

          return {
            lessonProgress: {
              ...state.lessonProgress,
              [lessonId]: {
                ...existingProgress,
                lessonId,
                status,
                completedAt: isNowCompleted ? now.toISOString() : undefined,
                lastViewedAt: now.toISOString(),
                // Définir masteredAt seulement si c'est la première fois qu'on maîtrise
                masteredAt: isNowCompleted
                  ? (existingProgress?.masteredAt || now.toISOString())
                  : existingProgress?.masteredAt,
                // Mettre à jour lastReviewedAt si on re-maîtrise
                lastReviewedAt: isNowCompleted && wasCompleted
                  ? now.toISOString()
                  : existingProgress?.lastReviewedAt,
                revisionSchedule,
              },
            },
            stats: {
              ...state.stats,
              totalLessonsCompleted: state.stats.totalLessonsCompleted + (isNowCompleted && !wasCompleted ? 1 : 0),
            },
          }
        })
      },

      completeLessonRevision: (lessonId, dayOffset) => {
        set((state) => {
          const progress = state.lessonProgress[lessonId]
          if (!progress) return state

          const now = new Date().toISOString()
          const updatedSchedule = progress.revisionSchedule.map((item) =>
            item.dayOffset === dayOffset
              ? { ...item, completed: true, completedAt: now }
              : item
          )

          return {
            lessonProgress: {
              ...state.lessonProgress,
              [lessonId]: {
                ...progress,
                revisionSchedule: updatedSchedule,
                lastReviewedAt: now, // Mettre à jour pour le calcul de décroissance
              },
            },
          }
        })
      },

      // === EXERCICES ===
      updateExerciseProgress: (exerciseId, progress) => {
        set((state) => ({
          exerciseProgress: {
            ...state.exerciseProgress,
            [exerciseId]: {
              ...state.exerciseProgress[exerciseId],
              exerciseId,
              ...progress,
            },
          },
        }))
      },

      markExerciseCompleted: (exerciseId, lessonId) => {
        set((state) => {
          const wasCompleted = state.exerciseProgress[exerciseId]?.status === 'completed'

          return {
            exerciseProgress: {
              ...state.exerciseProgress,
              [exerciseId]: {
                ...state.exerciseProgress[exerciseId],
                exerciseId,
                lessonId,
                status: 'completed',
                completedAt: new Date().toISOString(),
              },
            },
            stats: {
              ...state.stats,
              totalExercisesCompleted: state.stats.totalExercisesCompleted + (wasCompleted ? 0 : 1),
            },
          }
        })
        get().recordActivity('exercise', exerciseId)
      },

      useExerciseHint: (exerciseId) => {
        set((state) => ({
          exerciseProgress: {
            ...state.exerciseProgress,
            [exerciseId]: {
              ...state.exerciseProgress[exerciseId],
              exerciseId,
              hintsUsed: (state.exerciseProgress[exerciseId]?.hintsUsed || 0) + 1,
              status: 'attempted',
            },
          },
        }))
      },

      viewExerciseSolution: (exerciseId) => {
        set((state) => ({
          exerciseProgress: {
            ...state.exerciseProgress,
            [exerciseId]: {
              ...state.exerciseProgress[exerciseId],
              exerciseId,
              solutionViewed: true,
            },
          },
        }))
      },

      // === FLASHCARDS ===
      updateFlashcardProgress: (flashcardId, progress) => {
        set((state) => ({
          flashcardProgress: {
            ...state.flashcardProgress,
            [flashcardId]: {
              ...state.flashcardProgress[flashcardId],
              flashcardId,
              ...progress,
            },
          },
        }))
      },

      reviewFlashcard: (flashcardId, lessonId, response) => {
        const now = new Date()
        const current = get().flashcardProgress[flashcardId] || {
          flashcardId,
          lessonId,
          easeFactor: 2.5,
          repetitionCount: 0,
          status: 'new',
          nextReviewAt: now.toISOString(),
        }

        // SM-2 algorithm modifications
        let newEaseFactor = current.easeFactor
        let newRepetitionCount = current.repetitionCount
        let newStatus = current.status

        switch (response) {
          case 'again':
            newEaseFactor = Math.max(1.3, current.easeFactor - 0.2)
            newRepetitionCount = 0
            newStatus = 'learning'
            break
          case 'hard':
            newEaseFactor = Math.max(1.3, current.easeFactor - 0.15)
            newRepetitionCount = current.repetitionCount + 1
            newStatus = 'review'
            break
          case 'good':
            newRepetitionCount = current.repetitionCount + 1
            newStatus = newRepetitionCount >= 5 ? 'mastered' : 'review'
            break
          case 'easy':
            newEaseFactor = Math.min(3.0, current.easeFactor + 0.15)
            newRepetitionCount = current.repetitionCount + 2
            newStatus = 'mastered'
            break
        }

        const nextReviewDate = calculateSpacedRepetitionDate(now, newRepetitionCount, newEaseFactor)

        set((state) => ({
          flashcardProgress: {
            ...state.flashcardProgress,
            [flashcardId]: {
              flashcardId,
              lessonId,
              easeFactor: newEaseFactor,
              repetitionCount: newRepetitionCount,
              lastReviewedAt: now.toISOString(),
              nextReviewAt: nextReviewDate.toISOString(),
              status: newStatus,
            },
          },
          stats: {
            ...state.stats,
            totalFlashcardsReviewed: state.stats.totalFlashcardsReviewed + 1,
          },
        }))

        get().recordActivity('flashcard', flashcardId)
      },

      getFlashcardsDueForReview: () => {
        const now = new Date()
        const progress = get().flashcardProgress

        return Object.entries(progress)
          .filter(([_, p]) => new Date(p.nextReviewAt) <= now)
          .map(([id]) => id)
      },

      // === QCM ===
      addQuizAttempt: (attempt) => {
        set((state) => ({
          quizAttempts: [...state.quizAttempts, attempt],
          stats: {
            ...state.stats,
            totalQuizzesTaken: state.stats.totalQuizzesTaken + 1,
            averageQuizScore:
              (state.stats.averageQuizScore * state.stats.totalQuizzesTaken + attempt.score) /
              (state.stats.totalQuizzesTaken + 1),
          },
        }))
        get().recordActivity('quiz', attempt.quizId)
      },

      getQuizAttempts: (lessonId) => {
        return get().quizAttempts.filter((a) => a.lessonId === lessonId)
      },

      // === SESSIONS ===
      startRevisionSession: (type) => {
        const sessionId = `session-${Date.now()}`
        const session: RevisionSession = {
          id: sessionId,
          type,
          startedAt: new Date().toISOString(),
          flashcardsReviewed: [],
          exercisesCompleted: [],
          score: 0,
        }

        set((state) => ({
          revisionSessions: [...state.revisionSessions, session],
        }))

        return sessionId
      },

      completeRevisionSession: (sessionId, flashcards, exercises, score) => {
        set((state) => ({
          revisionSessions: state.revisionSessions.map((s) =>
            s.id === sessionId
              ? {
                  ...s,
                  completedAt: new Date().toISOString(),
                  flashcardsReviewed: flashcards,
                  exercisesCompleted: exercises,
                  score,
                }
              : s
          ),
        }))
      },

      // === PARCOURS ===
      startPath: (pathId) => {
        set({
          activePath: {
            pathId,
            startedAt: new Date().toISOString(),
            currentDay: 1,
            completedDays: [],
            lastActivityAt: new Date().toISOString(),
          },
        })
      },

      updatePathProgress: (day) => {
        set((state) => ({
          activePath: state.activePath
            ? {
                ...state.activePath,
                currentDay: day + 1,
                completedDays: [...state.activePath.completedDays, day],
                lastActivityAt: new Date().toISOString(),
              }
            : undefined,
        }))
      },

      clearActivePath: () => {
        set({ activePath: undefined })
      },

      // === STATISTIQUES ===
      updateStats: (partial) => {
        set((state) => ({
          stats: { ...state.stats, ...partial },
        }))
      },

      incrementStreak: () => {
        const today = getToday()
        const { stats } = get()
        const lastDate = stats.lastActivityDate

        set((state) => {
          const yesterday = new Date()
          yesterday.setDate(yesterday.getDate() - 1)
          const yesterdayStr = yesterday.toISOString().split('T')[0]

          let newStreak = state.stats.currentStreak
          if (lastDate === today) {
            // Déjà actif aujourd'hui
            newStreak = state.stats.currentStreak
          } else if (lastDate === yesterdayStr) {
            // Actif hier, on incrémente
            newStreak = state.stats.currentStreak + 1
          } else {
            // Pas actif hier, on repart à 1
            newStreak = 1
          }

          return {
            stats: {
              ...state.stats,
              currentStreak: newStreak,
              longestStreak: Math.max(newStreak, state.stats.longestStreak),
              lastActivityDate: today,
            },
          }
        })
      },

      resetStreak: () => {
        set((state) => ({
          stats: { ...state.stats, currentStreak: 0 },
        }))
      },

      recordStudyTime: (minutes) => {
        set((state) => ({
          stats: {
            ...state.stats,
            totalStudyTime: state.stats.totalStudyTime + minutes,
          },
        }))
      },

      // === ACTIVITÉ QUOTIDIENNE ===
      recordActivity: (type, id) => {
        const today = getToday()

        set((state) => {
          const todayActivity = state.dailyActivities[today] || {
            date: today,
            lessonsViewed: [],
            exercisesCompleted: [],
            flashcardsReviewed: [],
            quizzesTaken: [],
            studyTime: 0,
          }

          const key = {
            lesson: 'lessonsViewed',
            exercise: 'exercisesCompleted',
            flashcard: 'flashcardsReviewed',
            quiz: 'quizzesTaken',
          }[type] as keyof DailyActivity

          const currentArray = todayActivity[key] as string[]
          if (!currentArray.includes(id)) {
            return {
              dailyActivities: {
                ...state.dailyActivities,
                [today]: {
                  ...todayActivity,
                  [key]: [...currentArray, id],
                },
              },
            }
          }

          return state
        })

        get().incrementStreak()
      },

      getTodayActivity: () => {
        const today = getToday()
        return get().dailyActivities[today]
      },

      // === PRÉFÉRENCES ===
      updatePreferences: (preferences) => {
        set((state) => ({
          preferences: { ...state.preferences, ...preferences },
        }))
      },

      // === UTILITAIRES ===
      resetAllProgress: () => {
        set({
          lessonProgress: {},
          exerciseProgress: {},
          flashcardProgress: {},
          quizAttempts: [],
          revisionSessions: [],
          activePath: undefined,
          stats: defaultStats,
          dailyActivities: {},
        })
      },

      exportData: () => {
        const state = get()
        return {
          lessonProgress: state.lessonProgress,
          exerciseProgress: state.exerciseProgress,
          flashcardProgress: state.flashcardProgress,
          quizAttempts: state.quizAttempts,
          revisionSessions: state.revisionSessions,
          activePath: state.activePath,
          stats: state.stats,
          dailyActivities: state.dailyActivities,
          preferences: state.preferences,
        }
      },

      importData: (data) => {
        set({
          lessonProgress: data.lessonProgress || {},
          exerciseProgress: data.exerciseProgress || {},
          flashcardProgress: data.flashcardProgress || {},
          quizAttempts: data.quizAttempts || [],
          revisionSessions: data.revisionSessions || [],
          activePath: data.activePath,
          stats: data.stats || defaultStats,
          dailyActivities: data.dailyActivities || {},
          preferences: data.preferences || defaultPreferences,
        })
      },
    }),
    {
      name: 'maths-terminale-storage',
      version: 1,
    }
  )
)
