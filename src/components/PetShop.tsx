'use client'

import { useState, useEffect } from 'react'
import { ShoppingBag, Sparkles, Check, Star, Lock, Palette, Shirt } from 'lucide-react'
import { usePetStore, ACCESSORIES, BACKGROUNDS, Accessory, Background } from '@/stores/petStore'
import { cn } from '@/lib/utils'

type ShopTab = 'accessories' | 'backgrounds'
type AccessoryCategory = 'all' | 'hat' | 'glasses' | 'necklace' | 'special'

const RARITY_COLORS = {
  common: 'from-slate-400 to-slate-500',
  rare: 'from-blue-400 to-blue-600',
  epic: 'from-purple-400 to-purple-600',
  legendary: 'from-amber-400 to-orange-500',
}

const RARITY_LABELS = {
  common: 'Commun',
  rare: 'Rare',
  epic: 'Épique',
  legendary: 'Légendaire',
}

const CATEGORY_LABELS = {
  all: 'Tous',
  hat: 'Chapeaux',
  glasses: 'Lunettes',
  necklace: 'Colliers',
  special: 'Spécial',
}

export function PetShop() {
  const [mounted, setMounted] = useState(false)
  const [activeTab, setActiveTab] = useState<ShopTab>('accessories')
  const [categoryFilter, setCategoryFilter] = useState<AccessoryCategory>('all')
  const [purchaseMessage, setPurchaseMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const {
    ownedAccessories,
    ownedBackgrounds,
    equippedAccessory,
    equippedBackground,
    buyAccessory,
    buyBackground,
    equipAccessory,
    equipBackground,
    getAvailablePoints,
  } = usePetStore()

  const availablePoints = getAvailablePoints()

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleBuyAccessory = (accessory: Accessory) => {
    if (ownedAccessories.includes(accessory.id)) {
      equipAccessory(accessory.id)
      return
    }

    const success = buyAccessory(accessory.id)
    if (success) {
      setPurchaseMessage({ type: 'success', text: `${accessory.name} acheté !` })
      equipAccessory(accessory.id)
    } else {
      setPurchaseMessage({ type: 'error', text: 'Points insuffisants !' })
    }
    setTimeout(() => setPurchaseMessage(null), 2000)
  }

  const handleBuyBackground = (background: Background) => {
    if (ownedBackgrounds.includes(background.id)) {
      equipBackground(background.id)
      return
    }

    const success = buyBackground(background.id)
    if (success) {
      setPurchaseMessage({ type: 'success', text: `${background.name} acheté !` })
      equipBackground(background.id)
    } else {
      setPurchaseMessage({ type: 'error', text: 'Points insuffisants !' })
    }
    setTimeout(() => setPurchaseMessage(null), 2000)
  }

  const filteredAccessories = ACCESSORIES.filter(
    a => categoryFilter === 'all' || a.category === categoryFilter
  )

  if (!mounted) {
    return <PetShopSkeleton />
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800">
      {/* Header */}
      <div className="border-b border-slate-200 p-4 dark:border-slate-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-primary-600 dark:text-primary-400" />
            <h3 className="font-bold text-slate-900 dark:text-slate-100">Boutique</h3>
          </div>
          <div className="flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 dark:bg-amber-900/30">
            <Star className="h-4 w-4 text-amber-500" />
            <span className="font-semibold text-amber-700 dark:text-amber-300">{availablePoints}</span>
          </div>
        </div>

        {/* Purchase message */}
        {purchaseMessage && (
          <div className={cn(
            'mt-3 rounded-lg px-3 py-2 text-sm font-medium',
            purchaseMessage.type === 'success'
              ? 'bg-success-100 text-success-700 dark:bg-success-900/30 dark:text-success-300'
              : 'bg-danger-100 text-danger-700 dark:bg-danger-900/30 dark:text-danger-300'
          )}>
            {purchaseMessage.text}
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-700">
        <button
          onClick={() => setActiveTab('accessories')}
          className={cn(
            'flex flex-1 items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors',
            activeTab === 'accessories'
              ? 'border-b-2 border-primary-500 text-primary-600 dark:text-primary-400'
              : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100'
          )}
        >
          <Shirt className="h-4 w-4" />
          Accessoires
        </button>
        <button
          onClick={() => setActiveTab('backgrounds')}
          className={cn(
            'flex flex-1 items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors',
            activeTab === 'backgrounds'
              ? 'border-b-2 border-primary-500 text-primary-600 dark:text-primary-400'
              : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100'
          )}
        >
          <Palette className="h-4 w-4" />
          Décors
        </button>
      </div>

      {/* Content */}
      <div className="p-4">
        {activeTab === 'accessories' && (
          <>
            {/* Category filters */}
            <div className="mb-4 flex flex-wrap gap-2">
              {(Object.keys(CATEGORY_LABELS) as AccessoryCategory[]).map(cat => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={cn(
                    'rounded-full px-3 py-1 text-xs font-medium transition-colors',
                    categoryFilter === cat
                      ? 'bg-primary-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600'
                  )}
                >
                  {CATEGORY_LABELS[cat]}
                </button>
              ))}
            </div>

            {/* Accessories grid */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {filteredAccessories.map(accessory => {
                const owned = ownedAccessories.includes(accessory.id)
                const equipped = equippedAccessory === accessory.id
                const canAfford = availablePoints >= accessory.price

                return (
                  <button
                    key={accessory.id}
                    onClick={() => handleBuyAccessory(accessory)}
                    disabled={!owned && !canAfford}
                    className={cn(
                      'relative flex flex-col items-center rounded-xl border-2 p-3 transition-all',
                      equipped
                        ? 'border-primary-500 bg-primary-50 dark:border-primary-400 dark:bg-primary-900/30'
                        : owned
                        ? 'border-success-300 bg-success-50 hover:bg-success-100 dark:border-success-600 dark:bg-success-900/20 dark:hover:bg-success-900/30'
                        : canAfford
                        ? 'border-slate-200 bg-slate-50 hover:border-slate-300 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:hover:border-slate-600'
                        : 'cursor-not-allowed border-slate-200 bg-slate-100 opacity-60 dark:border-slate-700 dark:bg-slate-800'
                    )}
                  >
                    {/* Rarity indicator */}
                    <div className={cn(
                      'absolute -top-1 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r px-2 py-0.5 text-[10px] font-bold text-white',
                      RARITY_COLORS[accessory.rarity]
                    )}>
                      {RARITY_LABELS[accessory.rarity]}
                    </div>

                    <span className="mt-2 text-3xl">{accessory.emoji}</span>
                    <span className="mt-1 text-xs font-medium text-slate-700 dark:text-slate-300">
                      {accessory.name}
                    </span>

                    {owned ? (
                      equipped ? (
                        <span className="mt-1 flex items-center gap-1 text-xs font-semibold text-primary-600 dark:text-primary-400">
                          <Check className="h-3 w-3" />
                          Équipé
                        </span>
                      ) : (
                        <span className="mt-1 text-xs text-success-600 dark:text-success-400">
                          Possédé
                        </span>
                      )
                    ) : (
                      <span className={cn(
                        'mt-1 flex items-center gap-1 text-xs font-semibold',
                        canAfford ? 'text-amber-600 dark:text-amber-400' : 'text-slate-400'
                      )}>
                        {!canAfford && <Lock className="h-3 w-3" />}
                        {accessory.price} pts
                      </span>
                    )}
                  </button>
                )
              })}
            </div>

            {/* Unequip button */}
            {equippedAccessory && (
              <button
                onClick={() => equipAccessory(null)}
                className="mt-4 w-full rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
              >
                Retirer l'accessoire
              </button>
            )}
          </>
        )}

        {activeTab === 'backgrounds' && (
          <div className="grid grid-cols-2 gap-3">
            {BACKGROUNDS.map(background => {
              const owned = ownedBackgrounds.includes(background.id)
              const equipped = equippedBackground === background.id
              const canAfford = availablePoints >= background.price

              return (
                <button
                  key={background.id}
                  onClick={() => handleBuyBackground(background)}
                  disabled={!owned && !canAfford}
                  className={cn(
                    'relative flex flex-col items-center overflow-hidden rounded-xl border-2 p-4 transition-all',
                    equipped
                      ? 'border-primary-500 dark:border-primary-400'
                      : owned
                      ? 'border-success-300 dark:border-success-600'
                      : canAfford
                      ? 'border-slate-200 hover:border-slate-300 dark:border-slate-700 dark:hover:border-slate-600'
                      : 'cursor-not-allowed border-slate-200 opacity-60 dark:border-slate-700'
                  )}
                >
                  {/* Background preview */}
                  <div className={cn(
                    'absolute inset-0 bg-gradient-to-br opacity-50',
                    background.gradient
                  )} />

                  {/* Rarity indicator */}
                  <div className={cn(
                    'relative z-10 mb-2 rounded-full bg-gradient-to-r px-2 py-0.5 text-[10px] font-bold text-white',
                    RARITY_COLORS[background.rarity]
                  )}>
                    {RARITY_LABELS[background.rarity]}
                  </div>

                  <span className="relative z-10 text-sm font-medium text-slate-800 dark:text-slate-200">
                    {background.name}
                  </span>

                  {owned ? (
                    equipped ? (
                      <span className="relative z-10 mt-1 flex items-center gap-1 text-xs font-semibold text-primary-600 dark:text-primary-400">
                        <Check className="h-3 w-3" />
                        Actif
                      </span>
                    ) : (
                      <span className="relative z-10 mt-1 text-xs text-success-600 dark:text-success-400">
                        Possédé
                      </span>
                    )
                  ) : (
                    <span className={cn(
                      'relative z-10 mt-1 flex items-center gap-1 text-xs font-semibold',
                      canAfford ? 'text-amber-700 dark:text-amber-300' : 'text-slate-500'
                    )}>
                      {!canAfford && <Lock className="h-3 w-3" />}
                      {background.price} pts
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

function PetShopSkeleton() {
  return (
    <div className="animate-pulse rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800">
      <div className="mb-4 h-6 w-32 rounded bg-slate-200 dark:bg-slate-700" />
      <div className="grid grid-cols-3 gap-3">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-24 rounded-xl bg-slate-200 dark:bg-slate-700" />
        ))}
      </div>
    </div>
  )
}
