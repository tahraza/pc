// Configuration des animations disponibles par leçon
// Ce fichier peut être importé côté serveur

export const animatedLessons = [
  'interferences',
  'electromagnetisme',
  'mouvement-circulaire',
  'mouvement-champ-uniforme',
  'circuit-rc',
  'thermodynamique',
  'ondes-mecaniques',
  'cinetique-chimique',
  'equilibres-chimiques',
  // Ajouter d'autres IDs de leçons avec animations ici
] as const

export type AnimatedLessonId = typeof animatedLessons[number]

// Helper pour vérifier si une leçon a une animation
export function hasAnimation(lessonId: string): boolean {
  return animatedLessons.includes(lessonId as AnimatedLessonId)
}
