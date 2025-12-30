import { Suspense } from 'react'
import FlashcardsClient from './FlashcardsClient'

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="text-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-purple-600 border-t-transparent mx-auto" />
        <p className="mt-4 text-slate-600">Chargement des flashcards...</p>
      </div>
    </div>
  )
}

export default function FlashcardsPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <FlashcardsClient />
    </Suspense>
  )
}
