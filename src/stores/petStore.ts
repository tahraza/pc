import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface PetType {
  id: string
  name: string
  emoji: string
  stages: PetStage[]
}

export interface PetStage {
  level: number
  name: string
  emoji: string
  requiredPoints: number
  description: string
}

// Accessory types
export interface Accessory {
  id: string
  name: string
  emoji: string
  price: number
  category: 'hat' | 'glasses' | 'necklace' | 'special'
  description: string
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
}

// Background types
export interface Background {
  id: string
  name: string
  price: number
  gradient: string
  description: string
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
}

// Pet traits
export interface PetTraits {
  happiness: number // 0-100 - Increases with activities
  energy: number // 0-100 - Decreases with work, resets daily
  intelligence: number // 0-100 - Permanent growth from learning
}

// Side quest types
export interface SideQuest {
  id: string
  title: string
  description: string
  type: 'lesson' | 'exercise' | 'quiz' | 'flashcard' | 'streak'
  requirement: number
  rewardPoints: number
  rewardTrait: keyof PetTraits
  rewardTraitAmount: number
  emoji: string
}

// Available side quests (refresh daily)
export const SIDE_QUESTS: SideQuest[] = [
  { id: 'sq-1', title: 'Lecteur avide', description: 'Lis 2 leçons complètes', type: 'lesson', requirement: 2, rewardPoints: 30, rewardTrait: 'intelligence', rewardTraitAmount: 5, emoji: '📖' },
  { id: 'sq-2', title: 'Résolveur d\'énigmes', description: 'Termine 3 exercices', type: 'exercise', requirement: 3, rewardPoints: 40, rewardTrait: 'intelligence', rewardTraitAmount: 8, emoji: '🧩' },
  { id: 'sq-3', title: 'Champion du QCM', description: 'Obtiens 80%+ à un QCM', type: 'quiz', requirement: 80, rewardPoints: 50, rewardTrait: 'happiness', rewardTraitAmount: 10, emoji: '🏆' },
  { id: 'sq-4', title: 'Maître des cartes', description: 'Révise 10 flashcards', type: 'flashcard', requirement: 10, rewardPoints: 25, rewardTrait: 'intelligence', rewardTraitAmount: 3, emoji: '🃏' },
  { id: 'sq-5', title: 'Persévérant', description: 'Maintiens une série de 3 jours', type: 'streak', requirement: 3, rewardPoints: 60, rewardTrait: 'happiness', rewardTraitAmount: 15, emoji: '🔥' },
  { id: 'sq-6', title: 'Explorateur', description: 'Lis 1 leçon d\'un nouveau chapitre', type: 'lesson', requirement: 1, rewardPoints: 20, rewardTrait: 'happiness', rewardTraitAmount: 5, emoji: '🧭' },
  { id: 'sq-7', title: 'Perfectionniste', description: 'Obtiens 100% à un QCM', type: 'quiz', requirement: 100, rewardPoints: 80, rewardTrait: 'intelligence', rewardTraitAmount: 15, emoji: '💯' },
  { id: 'sq-8', title: 'Marathonien', description: 'Révise 20 flashcards', type: 'flashcard', requirement: 20, rewardPoints: 45, rewardTrait: 'energy', rewardTraitAmount: -10, emoji: '🏃' },
]

// Available accessories
export const ACCESSORIES: Accessory[] = [
  // Hats
  { id: 'hat-party', name: 'Chapeau de fête', emoji: '🎉', price: 100, category: 'hat', description: 'Pour célébrer tes victoires !', rarity: 'common' },
  { id: 'hat-wizard', name: 'Chapeau de mage', emoji: '🧙', price: 200, category: 'hat', description: 'La magie de la physique !', rarity: 'rare' },
  { id: 'hat-crown', name: 'Couronne royale', emoji: '👑', price: 500, category: 'hat', description: 'Pour le roi/la reine des sciences', rarity: 'epic' },
  { id: 'hat-graduate', name: 'Toque de diplômé', emoji: '🎓', price: 300, category: 'hat', description: 'Prêt pour le bac !', rarity: 'rare' },
  { id: 'hat-santa', name: 'Bonnet de Noël', emoji: '🎅', price: 150, category: 'hat', description: 'Ho ho ho !', rarity: 'common' },
  { id: 'hat-chef', name: 'Toque de chef', emoji: '👨‍🍳', price: 200, category: 'hat', description: 'Chef en chimie !', rarity: 'rare' },

  // Glasses
  { id: 'glasses-sun', name: 'Lunettes de soleil', emoji: '🕶️', price: 100, category: 'glasses', description: 'Trop cool pour l\'école', rarity: 'common' },
  { id: 'glasses-nerd', name: 'Lunettes de savant', emoji: '🤓', price: 150, category: 'glasses', description: 'Look scientifique', rarity: 'common' },
  { id: 'glasses-3d', name: 'Lunettes 3D', emoji: '👓', price: 200, category: 'glasses', description: 'Vision multidimensionnelle', rarity: 'rare' },

  // Necklaces
  { id: 'necklace-star', name: 'Collier étoile', emoji: '⭐', price: 150, category: 'necklace', description: 'Brillant comme les étoiles', rarity: 'common' },
  { id: 'necklace-heart', name: 'Collier cœur', emoji: '💖', price: 200, category: 'necklace', description: 'Avec amour', rarity: 'rare' },
  { id: 'necklace-diamond', name: 'Collier diamant', emoji: '💎', price: 400, category: 'necklace', description: 'Précieux et brillant', rarity: 'epic' },
  { id: 'necklace-atom', name: 'Pendentif atome', emoji: '⚛️', price: 300, category: 'necklace', description: 'L\'essence de la matière', rarity: 'rare' },

  // Special
  { id: 'special-wings', name: 'Ailes d\'ange', emoji: '👼', price: 600, category: 'special', description: 'Envole-toi vers la réussite', rarity: 'epic' },
  { id: 'special-halo', name: 'Auréole', emoji: '😇', price: 500, category: 'special', description: 'Un ange studieux', rarity: 'epic' },
  { id: 'special-fire', name: 'Aura de feu', emoji: '🔥', price: 800, category: 'special', description: 'En feu !', rarity: 'legendary' },
  { id: 'special-rainbow', name: 'Arc-en-ciel', emoji: '🌈', price: 700, category: 'special', description: 'Toutes les couleurs du spectre', rarity: 'legendary' },
  { id: 'special-lightning', name: 'Éclair', emoji: '⚡', price: 600, category: 'special', description: 'Rapide comme l\'éclair', rarity: 'epic' },

  // ==========================================
  // Accessoires Premium (1000+ points)
  // ==========================================

  // Premium Hats
  { id: 'hat-einstein', name: 'Perruque Einstein', emoji: '👨‍🔬', price: 1500, category: 'hat', description: 'E = mc² dans le style !', rarity: 'legendary' },
  { id: 'hat-astronaut', name: 'Casque d\'astronaute', emoji: '👨‍🚀', price: 2000, category: 'hat', description: 'Prêt pour l\'espace', rarity: 'legendary' },
  { id: 'hat-pharaoh', name: 'Coiffe de pharaon', emoji: '🏺', price: 1800, category: 'hat', description: 'Roi de l\'ancienne Égypte', rarity: 'legendary' },
  { id: 'hat-viking', name: 'Casque Viking', emoji: '⚔️', price: 1200, category: 'hat', description: 'Conquérant des examens', rarity: 'epic' },

  // Premium Glasses
  { id: 'glasses-vr', name: 'Casque VR', emoji: '🥽', price: 1500, category: 'glasses', description: 'Vision du futur', rarity: 'legendary' },
  { id: 'glasses-monocle', name: 'Monocle d\'or', emoji: '🧐', price: 1000, category: 'glasses', description: 'Élégance scientifique', rarity: 'epic' },
  { id: 'glasses-laser', name: 'Lunettes laser', emoji: '🔴', price: 2500, category: 'glasses', description: 'Vision perçante', rarity: 'legendary' },

  // Premium Necklaces
  { id: 'necklace-planet', name: 'Pendentif système solaire', emoji: '🪐', price: 1200, category: 'necklace', description: 'Le cosmos autour du cou', rarity: 'epic' },
  { id: 'necklace-infinity', name: 'Collier infini', emoji: '♾️', price: 2000, category: 'necklace', description: 'Limites infinies', rarity: 'legendary' },
  { id: 'necklace-quantum', name: 'Pendentif quantique', emoji: '🔮', price: 2500, category: 'necklace', description: 'Superposition d\'états', rarity: 'legendary' },

  // Ultra Premium Special
  { id: 'special-blackhole', name: 'Trou noir', emoji: '🕳️', price: 3000, category: 'special', description: 'Attire les bonnes notes', rarity: 'legendary' },
  { id: 'special-phoenix', name: 'Ailes de phénix', emoji: '🔥🦅', price: 3500, category: 'special', description: 'Renaître de ses erreurs', rarity: 'legendary' },
  { id: 'special-galaxy', name: 'Aura galactique', emoji: '🌌', price: 4000, category: 'special', description: 'L\'univers t\'entoure', rarity: 'legendary' },
  { id: 'special-time', name: 'Distorsion temporelle', emoji: '⏳', price: 4500, category: 'special', description: 'Maîtrise le temps', rarity: 'legendary' },
  { id: 'special-cosmic', name: 'Énergie cosmique ultime', emoji: '✨🌟✨', price: 5000, category: 'special', description: 'Pouvoir absolu du cosmos', rarity: 'legendary' },
]

// Available backgrounds
export const BACKGROUNDS: Background[] = [
  { id: 'bg-default', name: 'Par défaut', price: 0, gradient: 'from-primary-50 via-white to-purple-50 dark:from-slate-800 dark:via-slate-800 dark:to-purple-900/20', description: 'Fond classique', rarity: 'common' },
  { id: 'bg-forest', name: 'Forêt enchantée', price: 150, gradient: 'from-green-100 via-emerald-50 to-teal-100 dark:from-green-900/40 dark:via-emerald-900/30 dark:to-teal-900/40', description: 'Au cœur de la nature', rarity: 'common' },
  { id: 'bg-ocean', name: 'Océan profond', price: 200, gradient: 'from-blue-100 via-cyan-50 to-sky-100 dark:from-blue-900/40 dark:via-cyan-900/30 dark:to-sky-900/40', description: 'Sous les vagues', rarity: 'rare' },
  { id: 'bg-sunset', name: 'Coucher de soleil', price: 200, gradient: 'from-orange-100 via-amber-50 to-rose-100 dark:from-orange-900/40 dark:via-amber-900/30 dark:to-rose-900/40', description: 'Couleurs du crépuscule', rarity: 'rare' },
  { id: 'bg-space', name: 'Espace galactique', price: 400, gradient: 'from-indigo-200 via-purple-100 to-pink-100 dark:from-indigo-900/50 dark:via-purple-900/40 dark:to-pink-900/50', description: 'Parmi les étoiles', rarity: 'epic' },
  { id: 'bg-aurora', name: 'Aurore boréale', price: 500, gradient: 'from-teal-100 via-green-100 to-cyan-100 dark:from-teal-900/50 dark:via-green-900/40 dark:to-cyan-900/50', description: 'Lumières du nord', rarity: 'epic' },
  { id: 'bg-candy', name: 'Monde sucré', price: 300, gradient: 'from-pink-100 via-fuchsia-50 to-violet-100 dark:from-pink-900/40 dark:via-fuchsia-900/30 dark:to-violet-900/40', description: 'Doux comme un bonbon', rarity: 'rare' },
  { id: 'bg-volcano', name: 'Volcan ardent', price: 450, gradient: 'from-red-200 via-orange-100 to-yellow-100 dark:from-red-900/50 dark:via-orange-900/40 dark:to-yellow-900/50', description: 'Chaleur volcanique', rarity: 'epic' },
  { id: 'bg-rainbow', name: 'Arc-en-ciel', price: 600, gradient: 'from-red-100 via-yellow-100 to-blue-100 dark:from-red-900/30 dark:via-yellow-900/30 dark:to-blue-900/30', description: 'Toutes les couleurs !', rarity: 'legendary' },
  { id: 'bg-gold', name: 'Trésor doré', price: 700, gradient: 'from-amber-200 via-yellow-100 to-amber-200 dark:from-amber-900/50 dark:via-yellow-900/40 dark:to-amber-900/50', description: 'Précieux comme l\'or', rarity: 'legendary' },
]

// Available pets
export const AVAILABLE_PETS: PetType[] = [
  {
    id: 'cat',
    name: 'Chat',
    emoji: '🐱',
    stages: [
      { level: 1, name: 'Chaton', emoji: '🐱', requiredPoints: 0, description: 'Un adorable petit chaton curieux' },
      { level: 2, name: 'Chat joueur', emoji: '😺', requiredPoints: 200, description: 'Il commence à jouer avec tout !' },
      { level: 3, name: 'Chat malin', emoji: '😸', requiredPoints: 500, description: 'Il a appris plein de tours' },
      { level: 4, name: 'Chat sage', emoji: '😻', requiredPoints: 1000, description: 'Un chat plein de sagesse' },
      { level: 5, name: 'Chat royal', emoji: '👑🐱', requiredPoints: 2000, description: 'Le roi des chats !' },
      { level: 6, name: 'Chat légendaire', emoji: '✨🐱✨', requiredPoints: 5000, description: 'Un chat mythique aux pouvoirs cosmiques' },
    ]
  },
  {
    id: 'dog',
    name: 'Chien',
    emoji: '🐶',
    stages: [
      { level: 1, name: 'Chiot', emoji: '🐶', requiredPoints: 0, description: 'Un petit chiot adorable' },
      { level: 2, name: 'Chien joueur', emoji: '🐕', requiredPoints: 200, description: 'Il adore jouer à la balle !' },
      { level: 3, name: 'Chien fidèle', emoji: '🦮', requiredPoints: 500, description: 'Ton meilleur ami' },
      { level: 4, name: 'Chien savant', emoji: '🐕‍🦺', requiredPoints: 1000, description: 'Il connaît tous les tours' },
      { level: 5, name: 'Super chien', emoji: '🦸🐶', requiredPoints: 2000, description: 'Un héros à quatre pattes !' },
      { level: 6, name: 'Chien céleste', emoji: '✨🐶✨', requiredPoints: 5000, description: 'Un gardien venu des étoiles' },
    ]
  },
  {
    id: 'rabbit',
    name: 'Lapin',
    emoji: '🐰',
    stages: [
      { level: 1, name: 'Lapereau', emoji: '🐰', requiredPoints: 0, description: 'Un petit lapin tout doux' },
      { level: 2, name: 'Lapin bondissant', emoji: '🐇', requiredPoints: 200, description: 'Il saute partout !' },
      { level: 3, name: 'Lapin gourmand', emoji: '🥕🐰', requiredPoints: 500, description: 'Amateur de carottes' },
      { level: 4, name: 'Lapin magicien', emoji: '🎩🐰', requiredPoints: 1000, description: 'Sorti du chapeau !' },
      { level: 5, name: 'Lapin de lune', emoji: '🌙🐰', requiredPoints: 2000, description: 'Le lapin lunaire' },
      { level: 6, name: 'Lapin cosmique', emoji: '✨🐰✨', requiredPoints: 5000, description: 'Maître de l\'espace-temps' },
    ]
  },
  {
    id: 'panda',
    name: 'Panda',
    emoji: '🐼',
    stages: [
      { level: 1, name: 'Bébé panda', emoji: '🐼', requiredPoints: 0, description: 'Un petit panda mignon' },
      { level: 2, name: 'Panda joueur', emoji: '🎋🐼', requiredPoints: 200, description: 'Il adore le bambou' },
      { level: 3, name: 'Panda zen', emoji: '🧘🐼', requiredPoints: 500, description: 'Maître de la méditation' },
      { level: 4, name: 'Panda kung-fu', emoji: '🥋🐼', requiredPoints: 1000, description: 'Le guerrier dragon !' },
      { level: 5, name: 'Panda empereur', emoji: '👑🐼', requiredPoints: 2000, description: 'Souverain paisible' },
      { level: 6, name: 'Panda céleste', emoji: '✨🐼✨', requiredPoints: 5000, description: 'Gardien de la sagesse éternelle' },
    ]
  },
  {
    id: 'fox',
    name: 'Renard',
    emoji: '🦊',
    stages: [
      { level: 1, name: 'Renardeau', emoji: '🦊', requiredPoints: 0, description: 'Un petit renard curieux' },
      { level: 2, name: 'Renard rusé', emoji: '🦊💨', requiredPoints: 200, description: 'Rapide et malin' },
      { level: 3, name: 'Renard chasseur', emoji: '🦊🎯', requiredPoints: 500, description: 'Expert en stratégie' },
      { level: 4, name: 'Renard mystique', emoji: '🌟🦊', requiredPoints: 1000, description: 'Doté de pouvoirs magiques' },
      { level: 5, name: 'Kitsune', emoji: '🔥🦊', requiredPoints: 2000, description: 'Esprit renard à neuf queues' },
      { level: 6, name: 'Renard divin', emoji: '✨🦊✨', requiredPoints: 5000, description: 'Divinité protectrice' },
    ]
  },
  {
    id: 'owl',
    name: 'Hibou',
    emoji: '🦉',
    stages: [
      { level: 1, name: 'Hibou bébé', emoji: '🦉', requiredPoints: 0, description: 'Un petit hibou sage' },
      { level: 2, name: 'Hibou curieux', emoji: '🦉📚', requiredPoints: 200, description: 'Toujours en train d\'apprendre' },
      { level: 3, name: 'Hibou lettré', emoji: '🦉🎓', requiredPoints: 500, description: 'Bibliothécaire en chef' },
      { level: 4, name: 'Hibou savant', emoji: '🦉✏️', requiredPoints: 1000, description: 'Professeur respecté' },
      { level: 5, name: 'Grand Duc', emoji: '👑🦉', requiredPoints: 2000, description: 'Maître de la connaissance' },
      { level: 6, name: 'Hibou mythique', emoji: '✨🦉✨', requiredPoints: 5000, description: 'Oracle de la sagesse infinie' },
    ]
  },
  {
    id: 'dragon',
    name: 'Dragon',
    emoji: '🐲',
    stages: [
      { level: 1, name: 'Œuf de dragon', emoji: '🥚🔥', requiredPoints: 0, description: 'Un œuf mystérieux...' },
      { level: 2, name: 'Bébé dragon', emoji: '🐲', requiredPoints: 200, description: 'Il vient d\'éclore !' },
      { level: 3, name: 'Dragon ado', emoji: '🐉', requiredPoints: 500, description: 'Apprend à cracher du feu' },
      { level: 4, name: 'Dragon adulte', emoji: '🔥🐉', requiredPoints: 1000, description: 'Un dragon majestueux' },
      { level: 5, name: 'Dragon ancien', emoji: '⚡🐉', requiredPoints: 2000, description: 'Gardien des trésors' },
      { level: 6, name: 'Dragon céleste', emoji: '✨🐉✨', requiredPoints: 5000, description: 'Maître des éléments' },
    ]
  },
]

interface PetState {
  selectedPetId: string | null
  petName: string
  currentPoints: number // Points accumulated for pet evolution (cumulative, never decreases)
  spentPoints: number // Points spent in shop

  // Customization
  ownedAccessories: string[]
  ownedBackgrounds: string[]
  equippedAccessory: string | null
  equippedBackground: string

  // Traits
  traits: PetTraits

  // Side quests
  activeSideQuests: string[] // IDs of 3 daily quests
  completedSideQuests: string[]
  lastSideQuestRefresh: string | null

  // Actions
  selectPet: (petId: string, name: string) => void
  addPetPoints: (points: number) => void
  getCurrentStage: () => PetStage | null
  getNextStage: () => PetStage | null
  getProgress: () => { current: number; next: number; percentage: number }
  getPetType: () => PetType | null
  renamePet: (name: string) => void

  // Shop actions
  getAvailablePoints: () => number // Points available for spending
  buyAccessory: (accessoryId: string) => boolean
  buyBackground: (backgroundId: string) => boolean
  equipAccessory: (accessoryId: string | null) => void
  equipBackground: (backgroundId: string) => void
  getEquippedAccessory: () => Accessory | null
  getEquippedBackground: () => Background

  // Trait actions
  updateTrait: (trait: keyof PetTraits, amount: number) => void
  feedPet: () => void // Restore energy using points
  playWithPet: () => void // Increase happiness using points

  // Side quest actions
  refreshSideQuests: () => void
  completeSideQuest: (questId: string) => void
  getActiveSideQuests: () => SideQuest[]
}

export const usePetStore = create<PetState>()(
  persist(
    (set, get) => ({
      selectedPetId: null,
      petName: '',
      currentPoints: 0,
      spentPoints: 0,
      ownedAccessories: [],
      ownedBackgrounds: ['bg-default'],
      equippedAccessory: null,
      equippedBackground: 'bg-default',
      traits: {
        happiness: 70,
        energy: 100,
        intelligence: 10,
      },
      activeSideQuests: [],
      completedSideQuests: [],
      lastSideQuestRefresh: null,

      selectPet: (petId, name) => {
        set({
          selectedPetId: petId,
          petName: name,
          currentPoints: 0,
        })
        // Initialize side quests when pet is selected
        get().refreshSideQuests()
      },

      addPetPoints: (points) => {
        set((state) => ({
          currentPoints: state.currentPoints + points
        }))
      },

      getCurrentStage: () => {
        const { selectedPetId, currentPoints } = get()
        if (!selectedPetId) return null

        const pet = AVAILABLE_PETS.find(p => p.id === selectedPetId)
        if (!pet) return null

        // Find the highest stage the pet qualifies for
        const qualifiedStages = pet.stages.filter(s => currentPoints >= s.requiredPoints)
        return qualifiedStages.length > 0 ? qualifiedStages[qualifiedStages.length - 1] : pet.stages[0]
      },

      getNextStage: () => {
        const { selectedPetId, currentPoints } = get()
        if (!selectedPetId) return null

        const pet = AVAILABLE_PETS.find(p => p.id === selectedPetId)
        if (!pet) return null

        // Find the next stage
        const nextStage = pet.stages.find(s => currentPoints < s.requiredPoints)
        return nextStage || null // null if at max level
      },

      getProgress: () => {
        const currentStage = get().getCurrentStage()
        const nextStage = get().getNextStage()
        const { currentPoints } = get()

        if (!currentStage) return { current: 0, next: 100, percentage: 0 }

        if (!nextStage) {
          // Max level reached
          return { current: currentPoints, next: currentPoints, percentage: 100 }
        }

        const progressInStage = currentPoints - currentStage.requiredPoints
        const stageTotal = nextStage.requiredPoints - currentStage.requiredPoints
        const percentage = (progressInStage / stageTotal) * 100

        return {
          current: progressInStage,
          next: stageTotal,
          percentage: Math.min(percentage, 100)
        }
      },

      getPetType: () => {
        const { selectedPetId } = get()
        if (!selectedPetId) return null
        return AVAILABLE_PETS.find(p => p.id === selectedPetId) || null
      },

      renamePet: (name) => {
        set({ petName: name })
      },

      // Shop actions
      getAvailablePoints: () => {
        const { currentPoints, spentPoints } = get()
        return currentPoints - spentPoints
      },

      buyAccessory: (accessoryId) => {
        const { ownedAccessories } = get()
        const availablePoints = get().getAvailablePoints()
        const accessory = ACCESSORIES.find(a => a.id === accessoryId)

        if (!accessory) return false
        if (ownedAccessories.includes(accessoryId)) return false
        if (availablePoints < accessory.price) return false

        set((state) => ({
          spentPoints: state.spentPoints + accessory.price,
          ownedAccessories: [...state.ownedAccessories, accessoryId],
        }))
        return true
      },

      buyBackground: (backgroundId) => {
        const { ownedBackgrounds } = get()
        const availablePoints = get().getAvailablePoints()
        const background = BACKGROUNDS.find(b => b.id === backgroundId)

        if (!background) return false
        if (ownedBackgrounds.includes(backgroundId)) return false
        if (availablePoints < background.price) return false

        set((state) => ({
          spentPoints: state.spentPoints + background.price,
          ownedBackgrounds: [...state.ownedBackgrounds, backgroundId],
        }))
        return true
      },

      equipAccessory: (accessoryId) => {
        const { ownedAccessories } = get()
        if (accessoryId === null || ownedAccessories.includes(accessoryId)) {
          set({ equippedAccessory: accessoryId })
        }
      },

      equipBackground: (backgroundId) => {
        const { ownedBackgrounds } = get()
        if (ownedBackgrounds.includes(backgroundId)) {
          set({ equippedBackground: backgroundId })
        }
      },

      getEquippedAccessory: () => {
        const { equippedAccessory } = get()
        if (!equippedAccessory) return null
        return ACCESSORIES.find(a => a.id === equippedAccessory) || null
      },

      getEquippedBackground: () => {
        const { equippedBackground } = get()
        return BACKGROUNDS.find(b => b.id === equippedBackground) || BACKGROUNDS[0]
      },

      // Trait actions
      updateTrait: (trait, amount) => {
        set((state) => ({
          traits: {
            ...state.traits,
            [trait]: Math.max(0, Math.min(100, state.traits[trait] + amount)),
          },
        }))
      },

      feedPet: () => {
        const { traits } = get()
        const availablePoints = get().getAvailablePoints()
        const cost = 20
        if (availablePoints >= cost && traits.energy < 100) {
          set((state) => ({
            spentPoints: state.spentPoints + cost,
            traits: {
              ...state.traits,
              energy: Math.min(100, state.traits.energy + 30),
            },
          }))
        }
      },

      playWithPet: () => {
        const { traits } = get()
        const availablePoints = get().getAvailablePoints()
        const cost = 15
        if (availablePoints >= cost && traits.happiness < 100) {
          set((state) => ({
            spentPoints: state.spentPoints + cost,
            traits: {
              ...state.traits,
              happiness: Math.min(100, state.traits.happiness + 20),
              energy: Math.max(0, state.traits.energy - 10),
            },
          }))
        }
      },

      // Side quest actions
      refreshSideQuests: () => {
        const today = new Date().toISOString().split('T')[0]
        const { lastSideQuestRefresh, completedSideQuests } = get()

        // Only refresh if it's a new day
        if (lastSideQuestRefresh === today) return

        // Pick 3 random quests that weren't completed today
        const availableQuests = SIDE_QUESTS.filter(q => !completedSideQuests.includes(q.id))
        const shuffled = [...availableQuests].sort(() => Math.random() - 0.5)
        const selected = shuffled.slice(0, 3).map(q => q.id)

        set({
          activeSideQuests: selected,
          completedSideQuests: [], // Reset completed quests for new day
          lastSideQuestRefresh: today,
        })
      },

      completeSideQuest: (questId) => {
        const { activeSideQuests, completedSideQuests, updateTrait } = get()
        const quest = SIDE_QUESTS.find(q => q.id === questId)

        if (!quest || completedSideQuests.includes(questId)) return
        if (!activeSideQuests.includes(questId)) return

        // Give rewards
        set((state) => ({
          currentPoints: state.currentPoints + quest.rewardPoints,
          completedSideQuests: [...state.completedSideQuests, questId],
          traits: {
            ...state.traits,
            [quest.rewardTrait]: Math.max(0, Math.min(100, state.traits[quest.rewardTrait] + quest.rewardTraitAmount)),
          },
        }))
      },

      getActiveSideQuests: () => {
        const { activeSideQuests } = get()
        return SIDE_QUESTS.filter(q => activeSideQuests.includes(q.id))
      },
    }),
    {
      name: 'physique-chimie-pet',
    }
  )
)
