'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Search, X, BookOpen, Brain, ClipboardList, FileQuestion } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SearchResult {
  id: string
  title: string
  type: 'lesson' | 'exercise' | 'flashcard' | 'qcm'
  track?: string
  url: string
  excerpt?: string
}

interface SearchModalProps {
  open: boolean
  onClose: () => void
}

const typeIcons = {
  lesson: BookOpen,
  exercise: ClipboardList,
  flashcard: Brain,
  qcm: FileQuestion,
}

const typeLabels = {
  lesson: 'Leçon',
  exercise: 'Exercice',
  flashcard: 'Flashcard',
  qcm: 'QCM',
}

export function SearchModal({ open, onClose }: SearchModalProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [loading, setLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  // Focus input when modal opens
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100)
      setQuery('')
      setResults([])
      setSelectedIndex(0)
    }
  }, [open])

  // Search function
  const performSearch = useCallback(async (searchQuery: string) => {
    if (searchQuery.length < 2) {
      setResults([])
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`)
      if (response.ok) {
        const data = await response.json()
        setResults(data.results || [])
        setSelectedIndex(0)
      }
    } catch (error) {
      console.error('Search error:', error)
      setResults([])
    } finally {
      setLoading(false)
    }
  }, [])

  // Debounced search
  useEffect(() => {
    const timeout = setTimeout(() => {
      performSearch(query)
    }, 200)
    return () => clearTimeout(timeout)
  }, [query, performSearch])

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex((i) => Math.min(i + 1, results.length - 1))
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex((i) => Math.max(i - 1, 0))
        break
      case 'Enter':
        e.preventDefault()
        if (results[selectedIndex]) {
          router.push(results[selectedIndex].url)
          onClose()
        }
        break
      case 'Escape':
        onClose()
        break
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="flex min-h-full items-start justify-center p-4 pt-[15vh]">
        <div className="relative w-full max-w-xl transform overflow-hidden rounded-xl bg-white shadow-2xl transition-all">
          {/* Search input */}
          <div className="flex items-center border-b border-slate-200 px-4">
            <Search className="h-5 w-5 text-slate-400" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Rechercher une leçon, un exercice, une notion..."
              className="flex-1 border-0 bg-transparent px-4 py-4 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-0"
            />
            <button
              onClick={onClose}
              className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Results */}
          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center text-slate-500">
                Recherche en cours...
              </div>
            ) : results.length > 0 ? (
              <ul className="divide-y divide-slate-100">
                {results.map((result, index) => {
                  const Icon = typeIcons[result.type]
                  return (
                    <li key={result.id}>
                      <button
                        onClick={() => {
                          router.push(result.url)
                          onClose()
                        }}
                        onMouseEnter={() => setSelectedIndex(index)}
                        className={cn(
                          'flex w-full items-start gap-3 px-4 py-3 text-left transition-colors',
                          selectedIndex === index ? 'bg-primary-50' : 'hover:bg-slate-50'
                        )}
                      >
                        <div
                          className={cn(
                            'flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg',
                            result.type === 'lesson' && 'bg-primary-100 text-primary-600',
                            result.type === 'exercise' && 'bg-amber-100 text-amber-600',
                            result.type === 'flashcard' && 'bg-purple-100 text-purple-600',
                            result.type === 'qcm' && 'bg-emerald-100 text-emerald-600'
                          )}
                        >
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-slate-900 truncate">
                              {result.title}
                            </span>
                            <span className="flex-shrink-0 text-xs text-slate-500">
                              {typeLabels[result.type]}
                            </span>
                          </div>
                          {result.excerpt && (
                            <p className="mt-0.5 text-sm text-slate-500 line-clamp-1">
                              {result.excerpt}
                            </p>
                          )}
                          {result.track && (
                            <span
                              className={cn(
                                'mt-1 inline-block text-xs px-2 py-0.5 rounded-full',
                                result.track === 'spe'
                                  ? 'bg-primary-100 text-primary-700'
                                  : 'bg-purple-100 text-purple-700'
                              )}
                            >
                              {result.track === 'spe' ? 'Spécialité' : 'Expertes'}
                            </span>
                          )}
                        </div>
                      </button>
                    </li>
                  )
                })}
              </ul>
            ) : query.length >= 2 ? (
              <div className="p-8 text-center">
                <p className="text-slate-500">Aucun résultat trouvé pour "{query}"</p>
                <p className="mt-1 text-sm text-slate-400">
                  Essayez avec d'autres mots-clés
                </p>
              </div>
            ) : (
              <div className="p-8 text-center">
                <p className="text-slate-500">Commencez à taper pour rechercher</p>
                <div className="mt-4 flex flex-wrap justify-center gap-2">
                  {['suites', 'dérivation', 'complexes', 'probabilités'].map((tag) => (
                    <button
                      key={tag}
                      onClick={() => setQuery(tag)}
                      className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-600 hover:bg-slate-200"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-4 py-2 text-xs text-slate-500">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <kbd className="rounded bg-slate-200 px-1.5 py-0.5">↑↓</kbd>
                pour naviguer
              </span>
              <span className="flex items-center gap-1">
                <kbd className="rounded bg-slate-200 px-1.5 py-0.5">↵</kbd>
                pour sélectionner
              </span>
            </div>
            <span className="flex items-center gap-1">
              <kbd className="rounded bg-slate-200 px-1.5 py-0.5">Esc</kbd>
              pour fermer
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
