import { Metadata } from 'next'
import TrouverErreurClient from './TrouverErreurClient'

export const metadata: Metadata = {
  title: 'Trouver l\'erreur | Physique-Chimie Terminale',
  description: 'Exercices pour développer ton esprit critique : trouve l\'erreur dans les solutions proposées !',
}

export default function TrouverErreurPage() {
  return <TrouverErreurClient />
}
