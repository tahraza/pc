import { Metadata } from 'next'
import ConceptualQuestionsClient from './ConceptualQuestionsClient'

export const metadata: Metadata = {
  title: 'Questions Conceptuelles | Physique-Chimie Terminale',
  description: 'Teste ta compréhension profonde avec des questions "Pourquoi ?" et "Que se passe-t-il si..." - pas que du calcul !',
}

export default function ConceptualQuestionsPage() {
  return <ConceptualQuestionsClient />
}
