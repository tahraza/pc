import { Metadata } from 'next'
import { Suspense } from 'react'
import ExercicesAleatoiresClient from './ExercicesAleatoiresClient'

export const metadata: Metadata = {
  title: 'Exercices Aléatoires | Physique-Chimie Terminale',
  description: 'Entraînement infini avec des exercices générés aléatoirement. Les valeurs changent à chaque fois pour maîtriser les méthodes.',
}

export default function ExercicesAleatoiresPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-900" />}>
      <ExercicesAleatoiresClient />
    </Suspense>
  )
}
