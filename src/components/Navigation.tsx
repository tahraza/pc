'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  BookOpen,
  GraduationCap,
  Brain,
  BarChart3,
  Search,
  Menu,
  X,
  Home,
  Lightbulb,
  ClipboardList,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { SearchModal } from './SearchModal'

const navigation = [
  { name: 'Accueil', href: '/', icon: Home },
  { name: 'Parcours', href: '/parcours', icon: GraduationCap },
  { name: 'Leçons', href: '/lecons', icon: BookOpen },
  { name: 'Exercices', href: '/exercices', icon: ClipboardList },
  { name: 'Flashcards', href: '/flashcards', icon: Brain },
  { name: 'Révision', href: '/revision', icon: Lightbulb },
  { name: 'Statistiques', href: '/stats', icon: BarChart3 },
]

export function Navigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const pathname = usePathname()

  // Handle keyboard shortcut for search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setSearchOpen(true)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <>
      <nav className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <div className="flex items-center">
              <Link href="/" className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-600 text-white">
                  <span className="text-lg font-bold">⚛</span>
                </div>
                <span className="hidden text-xl font-bold text-slate-900 sm:block">
                  Physique<span className="text-primary-600">Chimie</span>
                </span>
              </Link>
            </div>

            {/* Desktop navigation */}
            <div className="hidden md:flex md:items-center md:gap-1">
              {navigation.map((item) => {
                const isActive = pathname === item.href ||
                  (item.href !== '/' && pathname.startsWith(item.href))
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      'flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-primary-50 text-primary-700'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.name}
                  </Link>
                )
              })}
            </div>

            {/* Search and mobile menu buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSearchOpen(true)}
                className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm text-slate-500 transition-colors hover:bg-slate-100"
                aria-label="Rechercher"
              >
                <Search className="h-4 w-4" />
                <span className="hidden sm:inline">Rechercher</span>
                <kbd className="hidden rounded bg-slate-200 px-1.5 py-0.5 text-xs font-medium text-slate-500 sm:inline">
                  ⌘K
                </kbd>
              </button>

              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="inline-flex items-center justify-center rounded-lg p-2 text-slate-600 hover:bg-slate-100 md:hidden"
                aria-label="Menu"
              >
                {mobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="border-t border-slate-200 bg-white md:hidden">
            <div className="space-y-1 px-4 py-3">
              {navigation.map((item) => {
                const isActive = pathname === item.href ||
                  (item.href !== '/' && pathname.startsWith(item.href))
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      'flex items-center gap-3 rounded-lg px-3 py-2 text-base font-medium transition-colors',
                      isActive
                        ? 'bg-primary-50 text-primary-700'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                    {item.name}
                  </Link>
                )
              })}
            </div>
          </div>
        )}
      </nav>

      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  )
}
