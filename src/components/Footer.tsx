import Link from 'next/link'
import { BookOpen, Github, Heart } from 'lucide-react'

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-600 text-white">
                <span className="text-base font-bold">⚛</span>
              </div>
              <span className="text-lg font-bold text-slate-900 dark:text-slate-100">
                Physique<span className="text-primary-600 dark:text-primary-400">Chimie</span>
              </span>
            </Link>
            <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
              Plateforme complète pour réviser la physique-chimie de Terminale.
              Cours, exercices, QCM et flashcards pour réussir le bac.
            </p>
          </div>

          {/* Quick links */}
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Navigation</h3>
            <ul className="mt-3 space-y-2">
              <li>
                <Link href="/lecons" className="text-sm text-slate-600 hover:text-primary-600 dark:text-slate-400 dark:hover:text-primary-400">
                  Toutes les leçons
                </Link>
              </li>
              <li>
                <Link href="/parcours" className="text-sm text-slate-600 hover:text-primary-600 dark:text-slate-400 dark:hover:text-primary-400">
                  Parcours de révision
                </Link>
              </li>
              <li>
                <Link href="/methode" className="text-sm text-slate-600 hover:text-primary-600 dark:text-slate-400 dark:hover:text-primary-400">
                  Méthode de travail
                </Link>
              </li>
              <li>
                <Link href="/stats" className="text-sm text-slate-600 hover:text-primary-600 dark:text-slate-400 dark:hover:text-primary-400">
                  Ma progression
                </Link>
              </li>
            </ul>
          </div>

          {/* Tracks */}
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Matières</h3>
            <ul className="mt-3 space-y-2">
              <li>
                <Link href="/lecons?track=physique" className="text-sm text-slate-600 hover:text-primary-600 dark:text-slate-400 dark:hover:text-primary-400">
                  Physique
                </Link>
              </li>
              <li>
                <Link href="/lecons?track=chimie" className="text-sm text-slate-600 hover:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-400">
                  Chimie
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 flex flex-col items-center justify-between gap-4 border-t border-slate-200 pt-8 dark:border-slate-700 sm:flex-row">
          <p className="flex items-center gap-1 text-sm text-slate-500 dark:text-slate-400">
            Fait avec <Heart className="h-4 w-4 text-danger-500" /> pour les élèves de Terminale
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Programme Bac 2024-2025
          </p>
        </div>
      </div>
    </footer>
  )
}
