'use client'

import { useState, useEffect } from 'react'
import { Scroll, Sparkles, Heart, Zap, Brain, Gift, Check, Cookie, Gamepad2 } from 'lucide-react'
import { usePetStore, SIDE_QUESTS, SideQuest, PetTraits } from '@/stores/petStore'
import { cn } from '@/lib/utils'

const TRAIT_CONFIG = {
  happiness: { icon: Heart, label: 'Bonheur', color: 'text-pink-500', bgColor: 'bg-pink-500' },
  energy: { icon: Zap, label: 'Énergie', color: 'text-amber-500', bgColor: 'bg-amber-500' },
  intelligence: { icon: Brain, label: 'Intelligence', color: 'text-blue-500', bgColor: 'bg-blue-500' },
}

export function PetSideQuests() {
  const [mounted, setMounted] = useState(false)
  const {
    selectedPetId,
    traits,
    activeSideQuests,
    completedSideQuests,
    getActiveSideQuests,
    getAvailablePoints,
    refreshSideQuests,
    feedPet,
    playWithPet,
  } = usePetStore()

  const availablePoints = getAvailablePoints()

  useEffect(() => {
    setMounted(true)
    // Refresh side quests on mount
    refreshSideQuests()
  }, [refreshSideQuests])

  if (!mounted || !selectedPetId) {
    return null
  }

  const quests = getActiveSideQuests()

  return (
    <div className="space-y-4">
      {/* Traits Section */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
        <h3 className="mb-3 flex items-center gap-2 font-semibold text-slate-900 dark:text-slate-100">
          <Sparkles className="h-4 w-4 text-purple-500" />
          Caractère de ton compagnon
        </h3>

        <div className="space-y-3">
          {(Object.keys(TRAIT_CONFIG) as Array<keyof PetTraits>).map((trait) => {
            const config = TRAIT_CONFIG[trait]
            const Icon = config.icon
            const value = traits[trait]

            return (
              <div key={trait}>
                <div className="mb-1 flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-sm font-medium text-slate-700 dark:text-slate-300">
                    <Icon className={cn('h-4 w-4', config.color)} />
                    {config.label}
                  </span>
                  <span className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                    {value}%
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700">
                  <div
                    className={cn('h-full rounded-full transition-all duration-500', config.bgColor)}
                    style={{ width: `${value}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>

        {/* Care actions */}
        <div className="mt-4 flex gap-2">
          <button
            onClick={feedPet}
            disabled={availablePoints < 20 || traits.energy >= 100}
            className={cn(
              'flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
              availablePoints >= 20 && traits.energy < 100
                ? 'bg-amber-100 text-amber-700 hover:bg-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:hover:bg-amber-900/50'
                : 'cursor-not-allowed bg-slate-100 text-slate-400 dark:bg-slate-700 dark:text-slate-500'
            )}
          >
            <Cookie className="h-4 w-4" />
            Nourrir (20 pts)
          </button>
          <button
            onClick={playWithPet}
            disabled={availablePoints < 15 || traits.happiness >= 100}
            className={cn(
              'flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
              availablePoints >= 15 && traits.happiness < 100
                ? 'bg-pink-100 text-pink-700 hover:bg-pink-200 dark:bg-pink-900/30 dark:text-pink-300 dark:hover:bg-pink-900/50'
                : 'cursor-not-allowed bg-slate-100 text-slate-400 dark:bg-slate-700 dark:text-slate-500'
            )}
          >
            <Gamepad2 className="h-4 w-4" />
            Jouer (15 pts)
          </button>
        </div>
      </div>

      {/* Side Quests Section */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
        <h3 className="mb-3 flex items-center gap-2 font-semibold text-slate-900 dark:text-slate-100">
          <Scroll className="h-4 w-4 text-amber-500" />
          Quêtes du jour
        </h3>

        {quests.length === 0 ? (
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Sélectionne un animal pour débloquer les quêtes !
          </p>
        ) : (
          <div className="space-y-2">
            {quests.map((quest) => {
              const isCompleted = completedSideQuests.includes(quest.id)
              const traitConfig = TRAIT_CONFIG[quest.rewardTrait]
              const TraitIcon = traitConfig.icon

              return (
                <div
                  key={quest.id}
                  className={cn(
                    'rounded-lg border p-3 transition-all',
                    isCompleted
                      ? 'border-success-200 bg-success-50 dark:border-success-800 dark:bg-success-900/20'
                      : 'border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/50'
                  )}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{quest.emoji}</span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className={cn(
                          'font-medium',
                          isCompleted
                            ? 'text-success-700 dark:text-success-300'
                            : 'text-slate-900 dark:text-slate-100'
                        )}>
                          {quest.title}
                        </h4>
                        {isCompleted && (
                          <Check className="h-4 w-4 text-success-500" />
                        )}
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400">
                        {quest.description}
                      </p>
                      <div className="mt-2 flex items-center gap-3 text-xs">
                        <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
                          <Gift className="h-3 w-3" />
                          +{quest.rewardPoints} pts
                        </span>
                        <span className={cn('flex items-center gap-1', traitConfig.color)}>
                          <TraitIcon className="h-3 w-3" />
                          {quest.rewardTraitAmount > 0 ? '+' : ''}{quest.rewardTraitAmount} {traitConfig.label}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        <p className="mt-3 text-center text-xs text-slate-500 dark:text-slate-400">
          Les quêtes se renouvellent chaque jour !
        </p>
      </div>
    </div>
  )
}
