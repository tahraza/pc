'use client'

import { useState } from 'react'
import { Download, ExternalLink, Maximize2, Minimize2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PDFViewerProps {
  url: string
  title?: string
  className?: string
}

export default function PDFViewer({ url, title = 'Document PDF', className }: PDFViewerProps) {
  const [isFullscreen, setIsFullscreen] = useState(false)

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
  }

  return (
    <div
      className={cn(
        'relative rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800 overflow-hidden',
        isFullscreen && 'fixed inset-4 z-50 rounded-xl shadow-2xl',
        className
      )}
    >
      {/* Toolbar */}
      <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-4 py-2 dark:border-slate-700 dark:bg-slate-800">
        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
          {title}
        </span>
        <div className="flex items-center gap-2">
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
            title="Ouvrir dans un nouvel onglet"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Nouvel onglet</span>
          </a>
          <a
            href={url}
            download
            className="flex items-center gap-1 rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
            title="Télécharger"
          >
            <Download className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Télécharger</span>
          </a>
          <button
            onClick={toggleFullscreen}
            className="flex items-center gap-1 rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
            title={isFullscreen ? 'Réduire' : 'Plein écran'}
          >
            {isFullscreen ? (
              <Minimize2 className="h-3.5 w-3.5" />
            ) : (
              <Maximize2 className="h-3.5 w-3.5" />
            )}
          </button>
        </div>
      </div>

      {/* PDF Embed */}
      <div className={cn('bg-slate-100 dark:bg-slate-900', isFullscreen ? 'h-[calc(100%-48px)]' : 'h-[70vh]')}>
        <object
          data={url}
          type="application/pdf"
          className="h-full w-full"
        >
          {/* Fallback for browsers that don't support object */}
          <iframe
            src={url}
            className="h-full w-full border-0"
            title={title}
          >
            <div className="flex h-full flex-col items-center justify-center p-8 text-center">
              <p className="mb-4 text-slate-600 dark:text-slate-400">
                Votre navigateur ne peut pas afficher ce PDF directement.
              </p>
              <a
                href={url}
                download
                className="flex items-center gap-2 rounded-lg bg-amber-600 px-4 py-2 font-medium text-white transition-colors hover:bg-amber-700"
              >
                <Download className="h-4 w-4" />
                Télécharger le PDF
              </a>
            </div>
          </iframe>
        </object>
      </div>

      {/* Fullscreen overlay background */}
      {isFullscreen && (
        <div
          className="fixed inset-0 z-[-1] bg-black/50"
          onClick={toggleFullscreen}
        />
      )}
    </div>
  )
}
