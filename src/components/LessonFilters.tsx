'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Filter, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Track, Module } from '@/types'

interface LessonFiltersProps {
  currentTrack?: Track
  currentChapter?: string
  currentDifficulty?: number
  structure: Module[]
}

export function LessonFilters({
  currentTrack,
  currentChapter,
  currentDifficulty,
  structure,
}: LessonFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const updateFilter = (key: string, value: string | undefined) => {
    const params = new URLSearchParams(searchParams.toString())

    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }

    // Reset chapter if track changes
    if (key === 'track' && value !== currentTrack) {
      params.delete('chapter')
    }

    router.push(`/lecons?${params.toString()}`)
  }

  const clearFilters = () => {
    router.push('/lecons')
  }

  const hasFilters = currentTrack || currentChapter || currentDifficulty

  // Get chapters for current track
  const currentModule = currentTrack
    ? structure.find((m) => m.track === currentTrack)
    : undefined

  return (
    <div className="mb-6 space-y-4">
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <Filter className="h-4 w-4" />
          Filtrer :
        </div>

        {/* Track filter */}
        <div className="flex gap-2">
          <button
            onClick={() => updateFilter('track', undefined)}
            className={cn(
              'px-3 py-1.5 text-sm rounded-lg transition-colors',
              !currentTrack
                ? 'bg-primary-600 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            )}
          >
            Tous
          </button>
          <button
            onClick={() => updateFilter('track', 'physique')}
            className={cn(
              'px-3 py-1.5 text-sm rounded-lg transition-colors',
              currentTrack === 'physique'
                ? 'bg-primary-600 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            )}
          >
            Physique
          </button>
          <button
            onClick={() => updateFilter('track', 'chimie')}
            className={cn(
              'px-3 py-1.5 text-sm rounded-lg transition-colors',
              currentTrack === 'chimie'
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            )}
          >
            Chimie
          </button>
        </div>

        {/* Difficulty filter */}
        <select
          value={currentDifficulty || ''}
          onChange={(e) => updateFilter('difficulty', e.target.value || undefined)}
          className="input w-auto"
        >
          <option value="">Toute difficulté</option>
          <option value="1">Facile</option>
          <option value="2">Accessible</option>
          <option value="3">Intermédiaire</option>
          <option value="4">Avancé</option>
          <option value="5">Expert</option>
        </select>

        {/* Chapter filter (only if track selected) */}
        {currentModule && (
          <select
            value={currentChapter || ''}
            onChange={(e) => updateFilter('chapter', e.target.value || undefined)}
            className="input w-auto"
          >
            <option value="">Tous les chapitres</option>
            {currentModule.chapters.map((chapter) => (
              <option key={chapter.id} value={chapter.id}>
                {chapter.title}
              </option>
            ))}
          </select>
        )}

        {/* Clear filters */}
        {hasFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700"
          >
            <X className="h-4 w-4" />
            Réinitialiser
          </button>
        )}
      </div>
    </div>
  )
}
