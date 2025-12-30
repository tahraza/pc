import { Suspense } from 'react'
import ExercisesClient from './ExercisesClient'

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="animate-pulse">
          <div className="h-8 w-48 bg-slate-200 rounded mb-4"></div>
          <div className="h-4 w-96 bg-slate-200 rounded mb-8"></div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-40 bg-slate-200 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ExercisesPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <ExercisesClient />
    </Suspense>
  )
}
