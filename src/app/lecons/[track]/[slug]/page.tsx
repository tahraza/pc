import { notFound } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Clock,
  CheckCircle,
  AlertTriangle,
  FileQuestion,
  Brain,
  ClipboardList,
  ChevronRight,
} from 'lucide-react'
import { getLessonBySlug, getAllLessons, getExercisesByLesson, getFlashcardsByLesson, getPreQuiz, getPostQuiz } from '@/lib/content'
import { getTrackLabel, getTrackColor, getDifficultyLabel, getDifficultyColor, formatDuration } from '@/lib/utils'
import { LessonContent } from '@/components/LessonContent'
import { LessonProgress } from '@/components/LessonProgress'
import { RevisionSchedule } from '@/components/RevisionSchedule'
import { LessonAnimation } from '@/components/animations'
import { hasAnimation } from '@/components/animations/config'
import type { Track } from '@/types'

interface PageProps {
  params: { track: string; slug: string }
}

export async function generateStaticParams() {
  const lessons = getAllLessons()
  return lessons.map((lesson) => ({
    track: lesson.track,
    slug: lesson.slug,
  }))
}

export default function LessonPage({ params }: PageProps) {
  const { track, slug } = params
  const lesson = getLessonBySlug(track as Track, slug)

  if (!lesson) {
    notFound()
  }

  const exercises = getExercisesByLesson(lesson.id)
  const flashcards = getFlashcardsByLesson(lesson.id)
  const preQuiz = getPreQuiz(lesson.id)
  const postQuiz = getPostQuiz(lesson.id)

  // Get prev/next lessons
  const allLessons = getAllLessons().filter((l) => l.track === lesson.track)
  const currentIndex = allLessons.findIndex((l) => l.slug === slug)
  const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null
  const nextLesson = currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mb-4">
            <Link href="/lecons" className="hover:text-primary-600 dark:hover:text-primary-400">
              Leçons
            </Link>
            <ChevronRight className="h-4 w-4" />
            <Link href={`/lecons?track=${track}`} className="hover:text-primary-600 dark:hover:text-primary-400">
              {getTrackLabel(track)}
            </Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-slate-900 dark:text-slate-100">{lesson.title}</span>
          </nav>

          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className={`badge ${getTrackColor(lesson.track)}`}>
                  {getTrackLabel(lesson.track)}
                </span>
                <span className={`badge ${getDifficultyColor(lesson.level)}`}>
                  {getDifficultyLabel(lesson.level)}
                </span>
              </div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">{lesson.title}</h1>
              <div className="mt-2 flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {formatDuration(lesson.estimatedTime)}
                </div>
                <div className="flex items-center gap-1">
                  <BookOpen className="h-4 w-4" />
                  {lesson.chapter}
                </div>
              </div>
            </div>

            <LessonProgress lessonId={lesson.id} />
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[1fr_300px]">
          {/* Main content */}
          <div>
            {/* Prerequisites warning */}
            {lesson.prerequisites.length > 0 && (
              <div className="mb-6 rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/30 p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-amber-900 dark:text-amber-200">Prérequis</h3>
                    <p className="mt-1 text-sm text-amber-800 dark:text-amber-300">
                      Cette leçon suppose que tu maîtrises : {lesson.prerequisites.join(', ')}
                    </p>
                    {preQuiz && (
                      <Link
                        href={`/qcm/${preQuiz.id}`}
                        className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-amber-700 dark:text-amber-300 hover:text-amber-900 dark:hover:text-amber-100"
                      >
                        <FileQuestion className="h-4 w-4" />
                        Faire le QCM de diagnostic
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Pre-quiz CTA */}
            {preQuiz && (
              <div className="mb-6 rounded-lg border border-primary-200 dark:border-primary-800 bg-primary-50 dark:bg-primary-900/30 p-4">
                <div className="flex items-start gap-3">
                  <FileQuestion className="h-5 w-5 text-primary-600 dark:text-primary-400 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="font-medium text-primary-900 dark:text-primary-200">QCM de diagnostic</h3>
                    <p className="mt-1 text-sm text-primary-800 dark:text-primary-300">
                      Évalue ton niveau avant de commencer pour un apprentissage personnalisé.
                    </p>
                  </div>
                  <Link
                    href={`/qcm/${preQuiz.id}`}
                    className="btn-primary text-sm"
                  >
                    Commencer
                  </Link>
                </div>
              </div>
            )}

            {/* Lesson content */}
            <div className="card">
              <LessonContent content={lesson.content} />
            </div>

            {/* Interactive animation if available */}
            {hasAnimation(lesson.id) && (
              <div className="mt-6">
                <LessonAnimation lessonId={lesson.id} />
              </div>
            )}

            {/* Post-quiz CTA */}
            {postQuiz && (
              <div className="mt-6 rounded-lg border border-success-200 dark:border-success-800 bg-success-50 dark:bg-success-900/30 p-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-success-600 dark:text-success-400 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="font-medium text-success-900 dark:text-success-200">Valide tes acquis</h3>
                    <p className="mt-1 text-sm text-success-800 dark:text-success-300">
                      Tu as terminé la leçon ? Teste ta compréhension avec le QCM de validation.
                    </p>
                  </div>
                  <Link
                    href={`/qcm/${postQuiz.id}`}
                    className="btn-success text-sm"
                  >
                    Faire le QCM
                  </Link>
                </div>
              </div>
            )}

            {/* Navigation prev/next */}
            <div className="mt-8 flex items-center justify-between">
              {prevLesson ? (
                <Link
                  href={`/lecons/${prevLesson.track}/${prevLesson.slug}`}
                  className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span className="text-sm">{prevLesson.title}</span>
                </Link>
              ) : (
                <div />
              )}

              {nextLesson ? (
                <Link
                  href={`/lecons/${nextLesson.track}/${nextLesson.slug}`}
                  className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400"
                >
                  <span className="text-sm">{nextLesson.title}</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              ) : (
                <div />
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Revision schedule */}
            <RevisionSchedule lessonId={lesson.id} />

            {/* Related exercises */}
            {exercises.length > 0 && (
              <div className="card">
                <h3 className="flex items-center gap-2 font-semibold text-slate-900 dark:text-slate-100">
                  <ClipboardList className="h-5 w-5 text-amber-600" />
                  Exercices ({exercises.length})
                </h3>
                <ul className="mt-4 space-y-2">
                  {exercises.slice(0, 5).map((exercise) => (
                    <li key={exercise.id}>
                      <Link
                        href={`/exercices/${exercise.id}`}
                        className="flex items-center justify-between text-sm text-slate-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400"
                      >
                        <span className="truncate">{exercise.title}</span>
                        <span className={`badge text-xs ${getDifficultyColor(exercise.difficulty)}`}>
                          {getDifficultyLabel(exercise.difficulty)}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
                {exercises.length > 5 && (
                  <Link
                    href={`/exercices?lesson=${lesson.id}`}
                    className="mt-4 block text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300"
                  >
                    Voir tous les exercices
                  </Link>
                )}
              </div>
            )}

            {/* Related flashcards */}
            {flashcards.length > 0 && (
              <div className="card">
                <h3 className="flex items-center gap-2 font-semibold text-slate-900 dark:text-slate-100">
                  <Brain className="h-5 w-5 text-purple-600" />
                  Flashcards ({flashcards.length})
                </h3>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                  Révise les notions clés avec les flashcards de cette leçon.
                </p>
                <Link
                  href={`/flashcards?lesson=${lesson.id}`}
                  className="btn-secondary mt-4 w-full text-center"
                >
                  Réviser les flashcards
                </Link>
              </div>
            )}

            {/* Tags */}
            {lesson.tags.length > 0 && (
              <div className="card">
                <h3 className="font-semibold text-slate-900 dark:text-slate-100">Tags</h3>
                <div className="mt-3 flex flex-wrap gap-2">
                  {lesson.tags.map((tag) => (
                    <Link
                      key={tag}
                      href={`/lecons?tag=${tag}`}
                      className="text-xs bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-1 rounded hover:bg-slate-200 dark:hover:bg-slate-600"
                    >
                      {tag}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
