import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import type { Lesson, LessonFrontmatter, Exercise, Flashcard, Quiz, Chapter, Module, Track } from '@/types'

const contentDirectory = path.join(process.cwd(), 'content')

// ==========================================
// Leçons
// ==========================================

export function getAllLessons(): Lesson[] {
  const lessonsDir = path.join(contentDirectory, 'lessons')

  if (!fs.existsSync(lessonsDir)) {
    return []
  }

  const tracks = ['physique', 'chimie']
  const lessons: Lesson[] = []

  for (const track of tracks) {
    const trackDir = path.join(lessonsDir, track)
    if (!fs.existsSync(trackDir)) continue

    const files = fs.readdirSync(trackDir).filter((f) => f.endsWith('.mdx') || f.endsWith('.md'))

    for (const file of files) {
      const filePath = path.join(trackDir, file)
      const fileContent = fs.readFileSync(filePath, 'utf-8')
      const { data, content } = matter(fileContent)

      const slug = file.replace(/\.mdx?$/, '')

      lessons.push({
        ...(data as LessonFrontmatter),
        content,
        slug,
      })
    }
  }

  return lessons.sort((a, b) => {
    if (a.track !== b.track) return a.track === 'physique' ? -1 : 1
    return a.order - b.order
  })
}

export function getLessonBySlug(track: Track, slug: string): Lesson | null {
  const lessonsDir = path.join(contentDirectory, 'lessons', track)

  const extensions = ['.mdx', '.md']
  for (const ext of extensions) {
    const filePath = path.join(lessonsDir, `${slug}${ext}`)
    if (fs.existsSync(filePath)) {
      const fileContent = fs.readFileSync(filePath, 'utf-8')
      const { data, content } = matter(fileContent)

      return {
        ...(data as LessonFrontmatter),
        content,
        slug,
      }
    }
  }

  return null
}

export function getLessonsByTrack(track: Track): Lesson[] {
  return getAllLessons().filter((l) => l.track === track)
}

export function getLessonsByChapter(chapter: string): Lesson[] {
  return getAllLessons().filter((l) => l.chapter === chapter)
}

// ==========================================
// Exercices
// ==========================================

export function getAllExercises(): Exercise[] {
  const exercisesPath = path.join(contentDirectory, 'exercises.json')

  if (!fs.existsSync(exercisesPath)) {
    return []
  }

  const content = fs.readFileSync(exercisesPath, 'utf-8')
  return JSON.parse(content) as Exercise[]
}

export function getExercisesByLesson(lessonId: string): Exercise[] {
  return getAllExercises().filter((e) => e.lessonId === lessonId)
}

export function getExerciseById(id: string): Exercise | null {
  return getAllExercises().find((e) => e.id === id) || null
}

export function getComprehensionExercises(lessonId: string): Exercise[] {
  return getAllExercises().filter((e) => e.lessonId === lessonId && e.isComprehension)
}

// ==========================================
// Flashcards
// ==========================================

export function getAllFlashcards(): Flashcard[] {
  const flashcardsPath = path.join(contentDirectory, 'flashcards.json')

  if (!fs.existsSync(flashcardsPath)) {
    return []
  }

  const content = fs.readFileSync(flashcardsPath, 'utf-8')
  return JSON.parse(content) as Flashcard[]
}

export function getFlashcardsByLesson(lessonId: string): Flashcard[] {
  return getAllFlashcards().filter((f) => f.lessonId === lessonId)
}

export function getFlashcardById(id: string): Flashcard | null {
  return getAllFlashcards().find((f) => f.id === id) || null
}

export function getFlashcardsByTag(tag: string): Flashcard[] {
  return getAllFlashcards().filter((f) => f.tags.includes(tag))
}

// ==========================================
// QCM
// ==========================================

export function getAllQuizzes(): Quiz[] {
  const quizzesPath = path.join(contentDirectory, 'quizzes.json')

  if (!fs.existsSync(quizzesPath)) {
    return []
  }

  const content = fs.readFileSync(quizzesPath, 'utf-8')
  return JSON.parse(content) as Quiz[]
}

export function getQuizzesByLesson(lessonId: string): Quiz[] {
  return getAllQuizzes().filter((q) => q.lessonId === lessonId)
}

export function getPreQuiz(lessonId: string): Quiz | null {
  return getAllQuizzes().find((q) => q.lessonId === lessonId && q.type === 'pre') || null
}

export function getPostQuiz(lessonId: string): Quiz | null {
  return getAllQuizzes().find((q) => q.lessonId === lessonId && q.type === 'post') || null
}

export function getQuizById(id: string): Quiz | null {
  return getAllQuizzes().find((q) => q.id === id) || null
}

// ==========================================
// Structure des cours (Modules et Chapitres)
// ==========================================

export function getCourseStructure(): Module[] {
  const structurePath = path.join(contentDirectory, 'structure.json')

  if (!fs.existsSync(structurePath)) {
    // Structure par défaut si le fichier n'existe pas
    return getDefaultStructure()
  }

  const content = fs.readFileSync(structurePath, 'utf-8')
  return JSON.parse(content) as Module[]
}

function getDefaultStructure(): Module[] {
  return [
    {
      id: 'physique-module',
      title: 'Physique',
      track: 'physique',
      description: 'Programme de physique en Terminale',
      chapters: [
        {
          id: 'ondes',
          title: 'Ondes et signaux',
          track: 'physique',
          order: 1,
          description: 'Ondes mécaniques, lumineuses, interférences, diffraction',
          lessons: ['ondes-mecaniques', 'ondes-lumineuses', 'interferences', 'diffraction'],
        },
        {
          id: 'mecanique',
          title: 'Mécanique',
          track: 'physique',
          order: 2,
          description: 'Lois de Newton, mouvement, champs',
          lessons: ['mouvement-newton', 'mouvement-champ-uniforme'],
        },
        {
          id: 'energie',
          title: 'Énergie',
          track: 'physique',
          order: 3,
          description: 'Énergie mécanique, radioactivité',
          lessons: ['energie-mecanique', 'radioactivite'],
        },
        {
          id: 'electricite',
          title: 'Électricité',
          track: 'physique',
          order: 4,
          description: 'Circuits RC, condensateurs',
          lessons: ['circuit-rc'],
        },
      ],
    },
    {
      id: 'chimie-module',
      title: 'Chimie',
      track: 'chimie',
      description: 'Programme de chimie en Terminale',
      chapters: [
        {
          id: 'acide-base',
          title: 'Acides et bases',
          track: 'chimie',
          order: 1,
          description: 'pH, pKa, réactions acido-basiques, titrages',
          lessons: ['acides-bases', 'titrages'],
        },
        {
          id: 'redox',
          title: 'Oxydoréduction',
          track: 'chimie',
          order: 2,
          description: 'Couples redox, piles, électrolyse',
          lessons: ['oxydoreduction', 'piles-electrolyse'],
        },
        {
          id: 'cinetique',
          title: 'Cinétique chimique',
          track: 'chimie',
          order: 3,
          description: 'Vitesse, facteurs cinétiques, catalyse',
          lessons: ['cinetique'],
        },
        {
          id: 'organique',
          title: 'Chimie organique',
          track: 'chimie',
          order: 4,
          description: 'Groupes fonctionnels, réactions, synthèse',
          lessons: ['chimie-organique', 'synthese-organique'],
        },
      ],
    },
  ]
}

export function getChapterById(chapterId: string): Chapter | null {
  const structure = getCourseStructure()

  for (const module of structure) {
    const chapter = module.chapters.find((c) => c.id === chapterId)
    if (chapter) return chapter
  }

  return null
}

// ==========================================
// Recherche
// ==========================================

export interface SearchableItem {
  id: string
  title: string
  type: 'lesson' | 'exercise' | 'flashcard' | 'qcm'
  track?: Track
  content: string
  url: string
}

export function getSearchIndex(): SearchableItem[] {
  const items: SearchableItem[] = []

  // Ajouter les leçons
  for (const lesson of getAllLessons()) {
    items.push({
      id: lesson.id,
      title: lesson.title,
      type: 'lesson',
      track: lesson.track,
      content: lesson.content,
      url: `/lecons/${lesson.track}/${lesson.slug}`,
    })
  }

  // Ajouter les exercices
  for (const exercise of getAllExercises()) {
    items.push({
      id: exercise.id,
      title: exercise.title,
      type: 'exercise',
      content: exercise.statement,
      url: `/exercices/${exercise.id}`,
    })
  }

  // Ajouter les flashcards
  for (const flashcard of getAllFlashcards()) {
    items.push({
      id: flashcard.id,
      title: flashcard.front,
      type: 'flashcard',
      content: `${flashcard.front} ${flashcard.back}`,
      url: `/flashcards?id=${flashcard.id}`,
    })
  }

  // Ajouter les QCM
  for (const quiz of getAllQuizzes()) {
    items.push({
      id: quiz.id,
      title: quiz.title,
      type: 'qcm',
      content: quiz.questions.map((q) => q.question).join(' '),
      url: `/qcm/${quiz.id}`,
    })
  }

  return items
}

// ==========================================
// Parcours de révision
// ==========================================

export function getRevisionPaths() {
  const pathsFile = path.join(contentDirectory, 'paths.json')

  if (!fs.existsSync(pathsFile)) {
    return getDefaultPaths()
  }

  const content = fs.readFileSync(pathsFile, 'utf-8')
  return JSON.parse(content)
}

function getDefaultPaths() {
  return [
    {
      id: 'bac-30-jours',
      name: 'Révision Bac 30 jours',
      description: 'Parcours intensif pour préparer le bac en 30 jours',
      duration: '30 jours',
      tracks: ['physique', 'chimie'],
      difficulty: 'mixed',
    },
    {
      id: 'remise-niveau',
      name: 'Remise à niveau',
      description: 'Reprendre les bases avant d\'attaquer les chapitres avancés',
      duration: '15 jours',
      tracks: ['physique', 'chimie'],
      difficulty: 'progressive',
    },
    {
      id: 'physique-only',
      name: 'Physique intensive',
      description: 'Se concentrer sur la physique : mécanique, ondes, énergie',
      duration: '20 jours',
      tracks: ['physique'],
      difficulty: 'mixed',
    },
    {
      id: 'chimie-only',
      name: 'Chimie intensive',
      description: 'Se concentrer sur la chimie : acides-bases, redox, organique',
      duration: '20 jours',
      tracks: ['chimie'],
      difficulty: 'mixed',
    },
  ]
}
