// ==========================================
// Types principaux pour l'application
// ==========================================

// Filière d'études
export type Track = 'physique' | 'chimie'

// Niveau de difficulté (1-5)
export type DifficultyLevel = 1 | 2 | 3 | 4 | 5

// État de maîtrise d'une notion
export type MasteryStatus = 'not_started' | 'in_progress' | 'mastered' | 'to_review'

// ==========================================
// Leçons
// ==========================================

export interface LessonFrontmatter {
  id: string
  title: string
  track: Track
  level: DifficultyLevel
  prerequisites: string[]
  tags: string[]
  estimatedTime: number // en minutes
  chapter: string
  order: number
}

export interface Lesson extends LessonFrontmatter {
  content: string
  slug: string
}

export interface LessonProgress {
  lessonId: string
  status: MasteryStatus
  completedAt?: string
  lastViewedAt: string
  masteredAt?: string // Date de maîtrise pour le calcul de décroissance
  lastReviewedAt?: string // Date de dernière révision
  preQuizScore?: number
  postQuizScore?: number
  revisionSchedule: RevisionScheduleItem[]
  notes?: string
}

export interface RevisionScheduleItem {
  dayOffset: number // J+1, J+3, J+10, J+30, J+90
  scheduledDate: string
  completed: boolean
  completedAt?: string
}

// ==========================================
// QCM
// ==========================================

export type QuizType = 'pre' | 'post'

export interface QuizQuestion {
  id: string
  question: string
  choices: string[]
  correct: number | number[] // index ou indices des bonnes réponses
  explanation: string
  tag: string
  difficulty: DifficultyLevel
  prereqRef?: string // Pour le preQuiz: référence à la notion testée
  multiSelect?: boolean
}

export interface Quiz {
  id: string
  lessonId: string
  type: QuizType
  title: string
  description: string
  questions: QuizQuestion[]
  passingScore: number // pourcentage minimum pour valider
}

export interface QuizAttempt {
  quizId: string
  lessonId: string
  type: QuizType
  startedAt: string
  completedAt?: string
  answers: Record<string, number | number[]>
  score: number
  totalQuestions: number
  recommendations?: string[]
}

// Score du preQuiz pour déterminer le parcours
export interface PreQuizDiagnostic {
  score: number
  level: 'low' | 'medium' | 'high'
  missingPrereqs: string[]
  recommendations: string[]
}

// ==========================================
// Exercices
// ==========================================

export interface Exercise {
  id: string
  lessonId: string
  title: string
  difficulty: DifficultyLevel
  statement: string
  hints: string[]
  solutionSteps: SolutionStep[]
  method: string
  commonMistakes: string[]
  tags: string[]
  isComprehension?: boolean // true si exercice de compréhension immédiate
  lessonUrl?: string // URL de la leçon associée (ajoutée par l'API)
}

export interface SolutionStep {
  step: number
  title: string
  content: string
  explanation?: string
}

export interface ExerciseProgress {
  exerciseId: string
  lessonId: string
  status: 'not_started' | 'attempted' | 'completed'
  hintsUsed: number
  solutionViewed: boolean
  completedAt?: string
  notes?: string
}

// ==========================================
// Exercices aléatoires (templates)
// ==========================================

export type VariableType = 'number' | 'integer' | 'choice'

export interface VariableDefinition {
  type: VariableType
  min?: number
  max?: number
  decimals?: number
  unit?: string
  choices?: string[] // Pour type 'choice'
}

export interface RandomExerciseTemplate {
  id: string
  lessonId: string
  title: string
  difficulty: DifficultyLevel
  description: string // Description courte du type d'exercice
  variables: Record<string, VariableDefinition>
  statement: string // Template avec {{variable}}
  solutionSteps: RandomSolutionStep[]
  finalAnswer: string // Template pour la réponse finale
  method: string
  hints: string[]
  commonMistakes: string[]
  tags: string[]
}

export interface RandomSolutionStep {
  step: number
  title: string
  content: string // Template avec {{variable}} et {{computed}}
  explanation?: string
  compute?: Record<string, string> // Calculs intermédiaires: nom -> formule JS
}

export interface GeneratedExercise {
  templateId: string
  lessonId: string
  title: string
  difficulty: DifficultyLevel
  values: Record<string, number | string>
  computed: Record<string, number | string>
  statement: string
  solutionSteps: SolutionStep[]
  finalAnswer: string
  method: string
  hints: string[]
  seed: number // Pour reproduire l'exercice
}

// ==========================================
// Flashcards
// ==========================================

export interface Flashcard {
  id: string
  lessonId: string
  front: string
  back: string
  tags: string[]
  level: DifficultyLevel
  category: 'formula' | 'definition' | 'method' | 'trap' | 'interpretation'
}

export interface FlashcardProgress {
  flashcardId: string
  lessonId: string
  easeFactor: number // SM-2: facteur de facilité (commence à 2.5)
  repetitionCount: number
  lastReviewedAt?: string
  nextReviewAt: string
  status: 'new' | 'learning' | 'review' | 'mastered'
}

// Réponse utilisateur lors de la révision
export type FlashcardResponse = 'again' | 'hard' | 'good' | 'easy'

// ==========================================
// Parcours de révision
// ==========================================

export interface RevisionPath {
  id: string
  name: string
  description: string
  duration: string // ex: "30 jours"
  tracks: Track[]
  lessons: string[] // IDs des leçons
  dailyGoals: DailyGoal[]
}

export interface DailyGoal {
  day: number
  lessonIds: string[]
  exerciseIds?: string[]
  reviewFlashcards: boolean
  estimatedTime: number
}

export interface UserPath {
  pathId: string
  startedAt: string
  currentDay: number
  completedDays: number[]
  lastActivityAt: string
}

// ==========================================
// Sessions de révision
// ==========================================

export interface RevisionSession {
  id: string
  type: 'short' | 'long' // 10 min ou 25 min
  startedAt: string
  completedAt?: string
  flashcardsReviewed: string[]
  exercisesCompleted: string[]
  score: number
}

// ==========================================
// Statistiques utilisateur
// ==========================================

export interface UserStats {
  totalLessonsCompleted: number
  totalExercisesCompleted: number
  totalFlashcardsReviewed: number
  totalQuizzesTaken: number
  averageQuizScore: number
  currentStreak: number
  longestStreak: number
  lastActivityDate: string
  totalStudyTime: number // en minutes
  weakTopics: string[] // tags des notions fragiles
  strongTopics: string[] // tags des notions maîtrisées
}

export interface DailyActivity {
  date: string
  lessonsViewed: string[]
  exercisesCompleted: string[]
  flashcardsReviewed: string[]
  quizzesTaken: string[]
  studyTime: number
}

// ==========================================
// Recherche
// ==========================================

export interface SearchResult {
  id: string
  title: string
  type: 'lesson' | 'exercise' | 'flashcard' | 'qcm'
  track?: Track
  url: string
  excerpt?: string
  score: number
}

export interface SearchIndex {
  lessons: Lesson[]
  exercises: Exercise[]
  flashcards: Flashcard[]
  quizzes: Quiz[]
}

// ==========================================
// Programme et structure des cours
// ==========================================

export interface Chapter {
  id: string
  title: string
  track: Track
  order: number
  description: string
  lessons: string[] // IDs des leçons
  icon?: string
}

export interface Module {
  id: string
  title: string
  track: Track
  chapters: Chapter[]
  description: string
}

// ==========================================
// État global de l'application
// ==========================================

export interface AppState {
  // Progression des leçons
  lessonProgress: Record<string, LessonProgress>
  // Progression des exercices
  exerciseProgress: Record<string, ExerciseProgress>
  // Progression des flashcards
  flashcardProgress: Record<string, FlashcardProgress>
  // Historique des QCM
  quizAttempts: QuizAttempt[]
  // Sessions de révision
  revisionSessions: RevisionSession[]
  // Parcours actif
  activePath?: UserPath
  // Statistiques
  stats: UserStats
  // Activité quotidienne
  dailyActivities: Record<string, DailyActivity>
  // Préférences
  preferences: UserPreferences
}

export interface UserPreferences {
  defaultTrack?: Track
  dailyGoalMinutes: number
  notificationsEnabled: boolean
  darkMode: boolean
  showCompletedLessons: boolean
}
