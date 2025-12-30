# MathsTerminale - Application de Révision Interactive

Une application web complète pour réviser les mathématiques de Terminale (Spécialité Maths et Maths Expertes) avec une approche pédagogique basée sur la répétition espacée et le testing effect.

## Fonctionnalités

### Contenu Pédagogique
- **12 leçons complètes** avec formules KaTeX, exemples résolus et erreurs fréquentes
  - 6 leçons Spécialité : Suites, Dérivation, Exponentielle, Logarithme, Probabilités, Primitives, Récurrence
  - 6 leçons Maths Expertes : Complexes (intro + géométrie), Matrices, Divisibilité, Congruences, Bézout
- **60 flashcards** avec système de répétition espacée (algorithme SM-2)
- **40 exercices** avec indices progressifs, solutions pas à pas et erreurs courantes
- **Quiz pré/post-leçon** : diagnostic avant et validation après chaque leçon

### Système d'Apprentissage
- **Répétition espacée** : révisions planifiées à J+1, J+3, J+10, J+30, J+90
- **Testing effect** : QCM diagnostiques pour identifier les lacunes
- **Sessions de révision** : modes 10 min (express) et 25 min (pomodoro)
- **Suivi de progression** : statistiques détaillées par leçon et par track

### Interface
- Design moderne et responsive avec Tailwind CSS
- Mode sombre/clair automatique
- Rendu mathématique avec KaTeX
- Recherche globale dans tout le contenu
- Navigation intuitive par parcours d'apprentissage

## Stack Technique

- **Framework** : Next.js 14 (App Router)
- **Langage** : TypeScript
- **Styling** : Tailwind CSS
- **State Management** : Zustand avec persistance localStorage
- **Maths** : KaTeX pour le rendu des formules
- **Contenu** : MDX pour les leçons, JSON pour les exercices/flashcards/quiz
- **Icônes** : Lucide React

## Installation

```bash
# Cloner le repository
git clone <repo-url>
cd maths

# Installer les dépendances
npm install

# Lancer en développement
npm run dev

# Build production
npm run build
npm start
```

## Structure du Projet

```
maths/
├── src/
│   ├── app/                    # Pages Next.js (App Router)
│   │   ├── page.tsx            # Page d'accueil
│   │   ├── lecons/             # Liste et détail des leçons
│   │   ├── exercices/          # Liste et détail des exercices
│   │   ├── flashcards/         # Système de flashcards
│   │   ├── qcm/                # Quiz pré/post leçon
│   │   ├── parcours/           # Parcours d'apprentissage
│   │   ├── revision/           # Sessions de révision
│   │   ├── stats/              # Statistiques
│   │   └── methode/            # Méthodologie d'apprentissage
│   ├── components/             # Composants React
│   │   ├── Navigation.tsx      # Barre de navigation
│   │   ├── Footer.tsx          # Pied de page
│   │   ├── LessonContent.tsx   # Rendu MDX avec KaTeX
│   │   ├── LessonProgress.tsx  # Barre de progression
│   │   └── ...
│   ├── lib/                    # Utilitaires
│   │   ├── content.ts          # Chargement du contenu
│   │   └── utils.ts            # Fonctions utilitaires
│   ├── store/                  # State management
│   │   └── useStore.ts         # Store Zustand
│   └── types/                  # Types TypeScript
│       └── index.ts
├── content/                    # Contenu pédagogique
│   ├── lessons/
│   │   ├── spe/                # Leçons Spécialité
│   │   └── expertes/           # Leçons Maths Expertes
│   ├── exercises.json          # 40 exercices
│   ├── flashcards.json         # 60 flashcards
│   └── quizzes.json            # Quiz pré/post
└── public/                     # Assets statiques
```

## Format des Leçons (MDX)

```mdx
---
id: "suites-definition"
title: "Suites numériques"
track: "spe"
level: 2
prerequisites: ["entiers-naturels"]
tags: ["suites", "arithmétique", "géométrique"]
estimatedTime: 45
chapter: "suites"
order: 1
---

# Titre de la leçon

## Intuition et analogie
...

:::definition
**Définition**
Contenu de la définition avec $formules$ LaTeX.
:::

:::theorem[Théorème de X]
Énoncé du théorème...
:::

:::property[Propriété]
...
:::

:::method[Méthode type]
1. Étape 1
2. Étape 2
:::

:::warning
**Attention !** Piège courant...
:::

:::tip
Astuce utile...
:::
```

## Format des Exercices (JSON)

```json
{
  "id": "ex-suites-001",
  "lessonId": "suites-definition",
  "title": "Reconnaître une suite arithmétique",
  "difficulty": 2,
  "statement": "Énoncé avec $formules$ LaTeX...",
  "hints": ["Indice 1", "Indice 2"],
  "solutionSteps": [
    { "step": 1, "title": "Étape 1", "content": "..." },
    { "step": 2, "title": "Étape 2", "content": "..." }
  ],
  "method": "Méthode générale...",
  "commonMistakes": ["Erreur 1", "Erreur 2"],
  "tags": ["suites", "arithmétique"],
  "isComprehension": false
}
```

## Format des Flashcards (JSON)

```json
{
  "id": "fc-001",
  "lessonId": "suites-definition",
  "front": "Question (avec $LaTeX$)",
  "back": "Réponse (avec $formules$)",
  "category": "formula|definition|method|trap|interpretation",
  "difficulty": 2,
  "tags": ["suites"]
}
```

## Format des Quiz (JSON)

```json
{
  "id": "pre-suites-definition",
  "lessonId": "suites-definition",
  "type": "pre|post",
  "title": "Diagnostic : Suites",
  "questions": [
    {
      "id": "q1",
      "question": "Question avec $LaTeX$...",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": 0,
      "explanation": "Explication de la réponse..."
    }
  ]
}
```

## Système de Répétition Espacée

L'application utilise un algorithme basé sur SM-2 pour la répétition espacée des flashcards :

- **Niveau 0** : Nouveau → révision dans 1 jour
- **Niveau 1** : → révision dans 3 jours
- **Niveau 2** : → révision dans 10 jours
- **Niveau 3** : → révision dans 30 jours
- **Niveau 4** : → révision dans 90 jours
- **Niveau 5** : Maîtrisé

La qualité de réponse (0-5) ajuste le niveau et la prochaine date de révision.

## Persistance

Toutes les données de progression sont stockées dans localStorage :
- Progression des leçons (lues, QCM passés)
- État des flashcards (niveau, prochaine révision)
- Historique des exercices
- Statistiques globales

## Méthodologie d'Apprentissage

L'application s'appuie sur des principes pédagogiques éprouvés :

1. **Testing Effect** : Apprendre en se testant est plus efficace que relire
2. **Répétition Espacée** : Réviser à intervalles croissants optimise la mémorisation
3. **Feedback Immédiat** : Corrections immédiates avec explications détaillées
4. **Diagnostic** : QCM pré-leçon pour identifier les lacunes
5. **Multi-représentations** : Même concept présenté de plusieurs façons

## Développement

```bash
# Vérifier le typage
npm run typecheck

# Linter
npm run lint

# Build de production
npm run build
```

## Contribution

Les contributions sont les bienvenues ! Pour ajouter du contenu :

1. **Nouvelle leçon** : Créer un fichier `.mdx` dans `content/lessons/[track]/`
2. **Nouveaux exercices** : Ajouter au fichier `content/exercises.json`
3. **Nouvelles flashcards** : Ajouter au fichier `content/flashcards.json`
4. **Nouveaux quiz** : Ajouter au fichier `content/quizzes.json`

## Licence

MIT

---

Développé pour les élèves de Terminale préparant le Baccalauréat.
