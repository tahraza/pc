'use client'

import dynamic from 'next/dynamic'
import { ComponentType } from 'react'

// Chargement dynamique des animations pour optimiser le bundle
const InterferencesAnimation = dynamic(
  () => import('@/components/InterferencesAnimation').then(mod => ({ default: mod.InterferencesAnimation })),
  {
    loading: () => (
      <div className="my-8 rounded-xl bg-slate-800 p-8 text-center text-slate-400">
        Chargement de l'animation...
      </div>
    ),
    ssr: false
  }
)

const ElectromagnetismeAnimation = dynamic(
  () => import('@/components/ElectromagnetismeAnimation').then(mod => ({ default: mod.ElectromagnetismeAnimation })),
  {
    loading: () => (
      <div className="my-8 rounded-xl bg-slate-800 p-8 text-center text-slate-400">
        Chargement de l'animation...
      </div>
    ),
    ssr: false
  }
)

const MouvementCirculaireAnimation = dynamic(
  () => import('@/components/MouvementCirculaireAnimation').then(mod => ({ default: mod.MouvementCirculaireAnimation })),
  {
    loading: () => (
      <div className="my-8 rounded-xl bg-slate-800 p-8 text-center text-slate-400">
        Chargement de l'animation...
      </div>
    ),
    ssr: false
  }
)

const TrajectoireParaboliqueAnimation = dynamic(
  () => import('@/components/TrajectoireParaboliqueAnimation').then(mod => ({ default: mod.TrajectoireParaboliqueAnimation })),
  {
    loading: () => (
      <div className="my-8 rounded-xl bg-slate-800 p-8 text-center text-slate-400">
        Chargement de l'animation...
      </div>
    ),
    ssr: false
  }
)

const CircuitRCAnimation = dynamic(
  () => import('@/components/CircuitRCAnimation').then(mod => ({ default: mod.CircuitRCAnimation })),
  {
    loading: () => (
      <div className="my-8 rounded-xl bg-slate-800 p-8 text-center text-slate-400">
        Chargement de l'animation...
      </div>
    ),
    ssr: false
  }
)

const ThermodynamiqueAnimation = dynamic(
  () => import('@/components/ThermodynamiqueAnimation').then(mod => ({ default: mod.ThermodynamiqueAnimation })),
  {
    loading: () => (
      <div className="my-8 rounded-xl bg-slate-800 p-8 text-center text-slate-400">
        Chargement de l'animation...
      </div>
    ),
    ssr: false
  }
)

const OndesMecaniquesAnimation = dynamic(
  () => import('@/components/OndesMecaniquesAnimation').then(mod => ({ default: mod.OndesMecaniquesAnimation })),
  {
    loading: () => (
      <div className="my-8 rounded-xl bg-slate-800 p-8 text-center text-slate-400">
        Chargement de l'animation...
      </div>
    ),
    ssr: false
  }
)

// Mapping des IDs de leçons vers leurs composants d'animation
const lessonAnimations: Record<string, ComponentType> = {
  'interferences': InterferencesAnimation,
  'electromagnetisme': ElectromagnetismeAnimation,
  'mouvement-circulaire': MouvementCirculaireAnimation,
  'mouvement-champ-uniforme': TrajectoireParaboliqueAnimation,
  'circuit-rc': CircuitRCAnimation,
  'thermodynamique': ThermodynamiqueAnimation,
  'ondes-mecaniques': OndesMecaniquesAnimation,
}

// Composant wrapper pour afficher l'animation d'une leçon
export function LessonAnimation({ lessonId }: { lessonId: string }) {
  const AnimationComponent = lessonAnimations[lessonId]

  if (!AnimationComponent) {
    return null
  }

  return <AnimationComponent />
}
