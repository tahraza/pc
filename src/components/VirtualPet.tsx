'use client'

import { useEffect, useState } from 'react'
import { Heart, Sparkles, Star, ArrowRight, Edit2, Check, X, Zap, Brain } from 'lucide-react'
import { usePetStore, AVAILABLE_PETS, PetType } from '@/stores/petStore'
import { cn } from '@/lib/utils'

export function VirtualPet() {
  const [mounted, setMounted] = useState(false)
  const {
    selectedPetId,
    petName,
    currentPoints,
    traits,
    getCurrentStage,
    getNextStage,
    getProgress,
    getPetType,
    getEquippedAccessory,
    getEquippedBackground,
  } = usePetStore()

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <VirtualPetSkeleton />
  }

  // If no pet selected, show selection
  if (!selectedPetId) {
    return <PetSelection />
  }

  const currentStage = getCurrentStage()
  const nextStage = getNextStage()
  const progress = getProgress()
  const petType = getPetType()
  const equippedAccessory = getEquippedAccessory()
  const equippedBackground = getEquippedBackground()

  if (!currentStage || !petType) return null

  return (
    <div className={cn(
      "relative overflow-hidden rounded-xl border border-slate-200 bg-gradient-to-br p-6 dark:border-slate-700",
      equippedBackground.gradient
    )}>
      {/* Decorative elements */}
      <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-white/30 blur-2xl dark:bg-black/20" />
      <div className="absolute -bottom-4 -left-4 h-20 w-20 rounded-full bg-white/30 blur-2xl dark:bg-black/20" />

      <div className="relative">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <PetNameEditor />
          <div className="flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 dark:bg-amber-900/30">
            <Star className="h-3.5 w-3.5 text-amber-500" />
            <span className="text-xs font-semibold text-amber-700 dark:text-amber-300">{currentPoints} pts</span>
          </div>
        </div>

        {/* Pet display */}
        <div className="mb-4 flex flex-col items-center">
          <div className="relative">
            {/* Accessory on top */}
            {equippedAccessory && (
              <div className="absolute -top-4 left-1/2 z-10 -translate-x-1/2 text-2xl">
                {equippedAccessory.emoji}
              </div>
            )}
            <div className="animate-bounce-slow flex h-24 w-24 items-center justify-center rounded-full bg-white/80 shadow-lg backdrop-blur dark:bg-slate-700/80">
              <span className="text-5xl">{currentStage.emoji}</span>
            </div>
            <div className="absolute -right-1 -top-1 flex h-7 w-7 items-center justify-center rounded-full bg-primary-500 text-xs font-bold text-white shadow">
              {currentStage.level}
            </div>
            {/* Hearts/happiness indicator */}
            <div className="absolute -bottom-1 left-1/2 flex -translate-x-1/2 gap-0.5">
              {[...Array(3)].map((_, i) => (
                <Heart
                  key={i}
                  className={cn(
                    'h-3.5 w-3.5',
                    i < Math.ceil(progress.percentage / 33.33)
                      ? 'fill-pink-500 text-pink-500'
                      : 'text-slate-300 dark:text-slate-600'
                  )}
                />
              ))}
            </div>
          </div>

          <h3 className="mt-3 text-lg font-bold text-slate-900 dark:text-slate-100">{currentStage.name}</h3>
          <p className="text-center text-sm text-slate-600 dark:text-slate-400">{currentStage.description}</p>
          {equippedAccessory && (
            <span className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              {equippedAccessory.emoji} {equippedAccessory.name}
            </span>
          )}

          {/* Mini trait indicators */}
          <div className="mt-2 flex items-center gap-3">
            <div className="flex items-center gap-1" title={`Bonheur: ${traits.happiness}%`}>
              <Heart className={cn(
                'h-3.5 w-3.5',
                traits.happiness > 70 ? 'fill-pink-500 text-pink-500' : traits.happiness > 30 ? 'text-pink-400' : 'text-slate-300'
              )} />
              <span className="text-xs text-slate-500 dark:text-slate-400">{traits.happiness}</span>
            </div>
            <div className="flex items-center gap-1" title={`Énergie: ${traits.energy}%`}>
              <Zap className={cn(
                'h-3.5 w-3.5',
                traits.energy > 70 ? 'fill-amber-500 text-amber-500' : traits.energy > 30 ? 'text-amber-400' : 'text-slate-300'
              )} />
              <span className="text-xs text-slate-500 dark:text-slate-400">{traits.energy}</span>
            </div>
            <div className="flex items-center gap-1" title={`Intelligence: ${traits.intelligence}%`}>
              <Brain className={cn(
                'h-3.5 w-3.5',
                traits.intelligence > 70 ? 'text-blue-500' : traits.intelligence > 30 ? 'text-blue-400' : 'text-slate-300'
              )} />
              <span className="text-xs text-slate-500 dark:text-slate-400">{traits.intelligence}</span>
            </div>
          </div>
        </div>

        {/* Evolution progress */}
        {nextStage ? (
          <div className="rounded-lg bg-white/60 p-3 dark:bg-slate-800/60">
            <div className="mb-2 flex items-center justify-between text-xs">
              <span className="font-medium text-slate-600 dark:text-slate-400">Prochaine évolution</span>
              <div className="flex items-center gap-1.5">
                <span className="text-lg">{nextStage.emoji}</span>
                <span className="font-semibold text-slate-700 dark:text-slate-300">{nextStage.name}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <div className="h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-primary-500 to-purple-500 transition-all duration-500"
                    style={{ width: `${progress.percentage}%` }}
                  />
                </div>
              </div>
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                {currentPoints}/{nextStage.requiredPoints}
              </span>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-amber-100 to-orange-100 p-3 dark:from-amber-900/30 dark:to-orange-900/30">
            <Sparkles className="h-4 w-4 text-amber-500" />
            <span className="text-sm font-semibold text-amber-700 dark:text-amber-300">Niveau maximum atteint !</span>
            <Sparkles className="h-4 w-4 text-amber-500" />
          </div>
        )}
      </div>
    </div>
  )
}

function PetNameEditor() {
  const { petName, renamePet } = usePetStore()
  const [isEditing, setIsEditing] = useState(false)
  const [editName, setEditName] = useState(petName)

  const handleSave = () => {
    if (editName.trim()) {
      renamePet(editName.trim())
    }
    setIsEditing(false)
  }

  const handleCancel = () => {
    setEditName(petName)
    setIsEditing(false)
  }

  if (isEditing) {
    return (
      <div className="flex items-center gap-1">
        <input
          type="text"
          value={editName}
          onChange={(e) => setEditName(e.target.value)}
          className="w-24 rounded border border-slate-300 bg-white px-2 py-1 text-sm dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
          autoFocus
          maxLength={12}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSave()
            if (e.key === 'Escape') handleCancel()
          }}
        />
        <button onClick={handleSave} className="rounded p-1 text-success-500 hover:bg-success-50 dark:hover:bg-success-900/30">
          <Check className="h-4 w-4" />
        </button>
        <button onClick={handleCancel} className="rounded p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700">
          <X className="h-4 w-4" />
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={() => setIsEditing(true)}
      className="group flex items-center gap-1.5 text-sm font-medium text-slate-700 hover:text-primary-600 dark:text-slate-300 dark:hover:text-primary-400"
    >
      <Heart className="h-4 w-4 fill-pink-200 text-pink-400" />
      {petName}
      <Edit2 className="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100" />
    </button>
  )
}

export function PetSelection() {
  const { selectPet } = usePetStore()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [petName, setPetName] = useState('')
  const [step, setStep] = useState<'select' | 'name'>('select')

  const handleConfirm = () => {
    if (selectedId && petName.trim()) {
      selectPet(selectedId, petName.trim())
    }
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
      {step === 'select' ? (
        <>
          <h3 className="mb-4 text-center text-lg font-bold text-slate-900 dark:text-slate-100">
            Choisis ton compagnon d'étude !
          </h3>
          <p className="mb-6 text-center text-sm text-slate-600 dark:text-slate-400">
            Ton animal évoluera au fur et à mesure que tu gagnes des points
          </p>

          <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {AVAILABLE_PETS.map((pet) => (
              <button
                key={pet.id}
                onClick={() => setSelectedId(pet.id)}
                className={cn(
                  'flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all hover:scale-105',
                  selectedId === pet.id
                    ? 'border-primary-500 bg-primary-50 dark:border-primary-400 dark:bg-primary-900/30'
                    : 'border-slate-200 bg-slate-50 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:hover:border-slate-600'
                )}
              >
                <span className="text-4xl">{pet.emoji}</span>
                <span className={cn(
                  'text-sm font-medium',
                  selectedId === pet.id
                    ? 'text-primary-700 dark:text-primary-300'
                    : 'text-slate-700 dark:text-slate-300'
                )}>
                  {pet.name}
                </span>
              </button>
            ))}
          </div>

          <button
            onClick={() => selectedId && setStep('name')}
            disabled={!selectedId}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary-600 px-4 py-2.5 font-medium text-white transition-colors hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Continuer
            <ArrowRight className="h-4 w-4" />
          </button>
        </>
      ) : (
        <>
          <button
            onClick={() => setStep('select')}
            className="mb-4 text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
          >
            ← Retour
          </button>

          <div className="mb-6 flex flex-col items-center">
            <span className="text-6xl">
              {AVAILABLE_PETS.find(p => p.id === selectedId)?.emoji}
            </span>
            <p className="mt-4 text-center text-slate-600 dark:text-slate-400">
              Comment veux-tu appeler ton {AVAILABLE_PETS.find(p => p.id === selectedId)?.name.toLowerCase()} ?
            </p>
          </div>

          <input
            type="text"
            value={petName}
            onChange={(e) => setPetName(e.target.value)}
            placeholder="Nom de ton compagnon..."
            className="mb-4 w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-center text-lg font-medium placeholder:text-slate-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:ring-primary-900"
            maxLength={12}
            autoFocus
          />

          <button
            onClick={handleConfirm}
            disabled={!petName.trim()}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary-600 px-4 py-2.5 font-medium text-white transition-colors hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Heart className="h-4 w-4" />
            Adopter
          </button>
        </>
      )}
    </div>
  )
}

export function VirtualPetCompact() {
  const [mounted, setMounted] = useState(false)
  const { selectedPetId, petName, getCurrentStage, getProgress } = usePetStore()

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted || !selectedPetId) return null

  const currentStage = getCurrentStage()
  const progress = getProgress()

  if (!currentStage) return null

  return (
    <div className="flex items-center gap-2">
      <div className="relative">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100 dark:bg-primary-900/30">
          <span className="text-lg">{currentStage.emoji}</span>
        </div>
        <div className="absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary-500 text-[10px] font-bold text-white">
          {currentStage.level}
        </div>
      </div>
      <div className="hidden sm:block">
        <div className="text-xs font-medium text-slate-700 dark:text-slate-300">{petName}</div>
        <div className="h-1 w-16 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
          <div
            className="h-full rounded-full bg-primary-500 transition-all"
            style={{ width: `${progress.percentage}%` }}
          />
        </div>
      </div>
    </div>
  )
}

function VirtualPetSkeleton() {
  return (
    <div className="animate-pulse rounded-xl border border-slate-200 bg-slate-50 p-6 dark:border-slate-700 dark:bg-slate-800">
      <div className="mb-4 flex justify-between">
        <div className="h-5 w-24 rounded bg-slate-200 dark:bg-slate-700" />
        <div className="h-5 w-16 rounded bg-slate-200 dark:bg-slate-700" />
      </div>
      <div className="flex flex-col items-center">
        <div className="h-24 w-24 rounded-full bg-slate-200 dark:bg-slate-700" />
        <div className="mt-3 h-6 w-32 rounded bg-slate-200 dark:bg-slate-700" />
        <div className="mt-2 h-4 w-48 rounded bg-slate-200 dark:bg-slate-700" />
      </div>
    </div>
  )
}
