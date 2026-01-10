import { Metadata } from 'next'
import ConceptMapClient from './ConceptMapClient'

export const metadata: Metadata = {
  title: 'Carte Conceptuelle | Physique-Chimie Terminale',
  description: 'Visualisez les liens entre les chapitres du programme de Physique-Chimie pour comprendre la cohérence du cours.',
}

export default function ConceptMapPage() {
  return <ConceptMapClient />
}
