import Link from 'next/link'
import { BookOpen, Clock, Tag, ChevronRight, Filter } from 'lucide-react'
import { getAllLessons, getCourseStructure } from '@/lib/content'
import { getTrackLabel, getTrackColor, getDifficultyLabel, getDifficultyColor, formatDuration } from '@/lib/utils'
import { LessonFilters } from '@/components/LessonFilters'
import type { Track } from '@/types'

interface PageProps {
  searchParams: { track?: string; chapter?: string; difficulty?: string }
}

export default function LessonsPage({ searchParams }: PageProps) {
  const allLessons = getAllLessons()
  const structure = getCourseStructure()

  // Apply filters
  let filteredLessons = allLessons

  if (searchParams.track) {
    filteredLessons = filteredLessons.filter((l) => l.track === searchParams.track)
  }

  if (searchParams.chapter) {
    filteredLessons = filteredLessons.filter((l) => l.chapter === searchParams.chapter)
  }

  if (searchParams.difficulty) {
    const difficulty = parseInt(searchParams.difficulty)
    filteredLessons = filteredLessons.filter((l) => l.level === difficulty)
  }

  // Group lessons by track and chapter
  const physiqueModule = structure.find((m) => m.track === 'physique')
  const chimieModule = structure.find((m) => m.track === 'chimie')

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Toutes les leçons</h1>
          <p className="mt-2 text-slate-600">
            {allLessons.length} leçons couvrant tout le programme de Terminale
          </p>
        </div>

        {/* Filters */}
        <LessonFilters
          currentTrack={searchParams.track as Track | undefined}
          currentChapter={searchParams.chapter}
          currentDifficulty={searchParams.difficulty ? parseInt(searchParams.difficulty) : undefined}
          structure={structure}
        />

        {/* Results count */}
        <div className="mb-6 text-sm text-slate-600">
          {filteredLessons.length} leçon{filteredLessons.length > 1 ? 's' : ''} trouvée{filteredLessons.length > 1 ? 's' : ''}
        </div>

        {/* Lessons Grid */}
        {filteredLessons.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredLessons.map((lesson) => (
              <Link
                key={lesson.id}
                href={`/lecons/${lesson.track}/${lesson.slug}`}
                className="card group hover:border-primary-200 hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`badge ${getTrackColor(lesson.track)}`}>
                      {getTrackLabel(lesson.track)}
                    </span>
                    <span className={`badge ${getDifficultyColor(lesson.level)}`}>
                      {getDifficultyLabel(lesson.level)}
                    </span>
                  </div>
                  <ChevronRight className="h-5 w-5 text-slate-400 group-hover:text-primary-600 transition-colors" />
                </div>

                <h3 className="mt-4 text-lg font-semibold text-slate-900 group-hover:text-primary-600 transition-colors">
                  {lesson.title}
                </h3>

                <div className="mt-4 flex items-center gap-4 text-sm text-slate-500">
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {formatDuration(lesson.estimatedTime)}
                  </div>
                  <div className="flex items-center gap-1">
                    <Tag className="h-4 w-4" />
                    {lesson.chapter}
                  </div>
                </div>

                {lesson.tags.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1">
                    {lesson.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded"
                      >
                        {tag}
                      </span>
                    ))}
                    {lesson.tags.length > 3 && (
                      <span className="text-xs text-slate-400">
                        +{lesson.tags.length - 3}
                      </span>
                    )}
                  </div>
                )}
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <BookOpen className="mx-auto h-12 w-12 text-slate-300" />
            <h3 className="mt-4 text-lg font-medium text-slate-900">
              Aucune leçon trouvée
            </h3>
            <p className="mt-2 text-slate-600">
              Essayez de modifier vos filtres
            </p>
            <Link
              href="/lecons"
              className="mt-4 inline-block text-primary-600 hover:text-primary-700"
            >
              Réinitialiser les filtres
            </Link>
          </div>
        )}

        {/* Quick access by chapter */}
        {!searchParams.track && !searchParams.chapter && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-slate-900 mb-8">Par chapitre</h2>

            <div className="space-y-12">
              {/* Physique */}
              {physiqueModule && (
                <div>
                  <h3 className="flex items-center gap-2 text-xl font-semibold text-slate-900 mb-4">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-600 text-white text-sm font-bold">
                      P
                    </span>
                    Physique
                  </h3>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {physiqueModule.chapters.map((chapter) => (
                      <Link
                        key={chapter.id}
                        href={`/lecons?track=physique&chapter=${chapter.id}`}
                        className="card group hover:border-primary-200 hover:shadow-md transition-all"
                      >
                        <h4 className="font-semibold text-slate-900 group-hover:text-primary-600">
                          {chapter.title}
                        </h4>
                        <p className="mt-1 text-sm text-slate-600">
                          {chapter.description}
                        </p>
                        <div className="mt-2 text-xs text-slate-500">
                          {chapter.lessons.length} leçon{chapter.lessons.length > 1 ? 's' : ''}
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Chimie */}
              {chimieModule && (
                <div>
                  <h3 className="flex items-center gap-2 text-xl font-semibold text-slate-900 mb-4">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-white text-sm font-bold">
                      C
                    </span>
                    Chimie
                  </h3>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {chimieModule.chapters.map((chapter) => (
                      <Link
                        key={chapter.id}
                        href={`/lecons?track=chimie&chapter=${chapter.id}`}
                        className="card group hover:border-emerald-200 hover:shadow-md transition-all"
                      >
                        <h4 className="font-semibold text-slate-900 group-hover:text-emerald-600">
                          {chapter.title}
                        </h4>
                        <p className="mt-1 text-sm text-slate-600">
                          {chapter.description}
                        </p>
                        <div className="mt-2 text-xs text-slate-500">
                          {chapter.lessons.length} leçon{chapter.lessons.length > 1 ? 's' : ''}
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
