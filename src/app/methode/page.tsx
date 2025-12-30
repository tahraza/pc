import {
  BookOpen,
  Brain,
  Target,
  Clock,
  Lightbulb,
  CheckCircle,
  AlertTriangle,
  Calendar,
  TrendingUp,
  MessageCircle,
} from 'lucide-react'

export default function MethodePage() {
  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-slate-900">
            Méthode de travail
          </h1>
          <p className="mt-3 text-lg text-slate-600 max-w-2xl mx-auto">
            Comment apprendre efficacement les mathématiques en Terminale ?
            Voici une méthode éprouvée pour progresser durablement.
          </p>
        </div>

        {/* Introduction */}
        <div className="card mb-8 bg-gradient-to-r from-primary-50 to-white border-primary-200">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-600 text-white flex-shrink-0">
              <Target className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Le principe fondamental</h2>
              <p className="mt-2 text-slate-700">
                Apprendre les maths, ce n'est pas mémoriser des formules par coeur. C'est <strong>comprendre</strong> d'abord,
                puis <strong>pratiquer</strong> régulièrement, et enfin <strong>réviser</strong> au bon moment pour ancrer
                les connaissances dans la mémoire à long terme.
              </p>
            </div>
          </div>
        </div>

        {/* The 5 passes */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
            <BookOpen className="h-7 w-7 text-primary-600" />
            La méthode des 5 passes
          </h2>

          <div className="space-y-4">
            {[
              {
                step: 1,
                title: 'Survol rapide',
                description: 'Lis la leçon en diagonale pour avoir une vue d\'ensemble. Regarde les titres, les définitions encadrées, les exemples. Ne cherche pas à tout comprendre, repère juste les grandes idées.',
                duration: '5 min',
                color: 'primary',
              },
              {
                step: 2,
                title: 'Questions préalables',
                description: 'Pose-toi des questions : "Qu\'est-ce que cette notion ?", "À quoi ça sert ?", "De quoi ai-je besoin pour comprendre ?". Ces questions activent ta curiosité et préparent ton cerveau à recevoir l\'information.',
                duration: '5 min',
                color: 'amber',
              },
              {
                step: 3,
                title: 'Lecture attentive',
                description: 'Lis maintenant en détail. Arrête-toi sur chaque définition, chaque propriété. Reformule avec tes propres mots. Fais les exercices de compréhension juste après chaque notion.',
                duration: '20-30 min',
                color: 'emerald',
              },
              {
                step: 4,
                title: 'Approfondissement',
                description: 'Creuse les points difficiles. Fais les exercices d\'application. Quand tu bloques, reviens à la théorie. Note les erreurs fréquentes pour ne pas les refaire.',
                duration: '30-45 min',
                color: 'purple',
              },
              {
                step: 5,
                title: 'Révision espacée',
                description: 'Reviens sur la leçon selon le planning : J+1, J+3, J+10, J+30, J+90. Utilise les flashcards, refais quelques exercices. C\'est ce qui ancre vraiment dans la mémoire.',
                duration: '10-15 min × 5',
                color: 'rose',
              },
            ].map((pass) => (
              <div
                key={pass.step}
                className="card flex items-start gap-4"
              >
                <div className={`flex h-10 w-10 items-center justify-center rounded-full bg-${pass.color}-600 text-white font-bold flex-shrink-0`}>
                  {pass.step}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-slate-900">{pass.title}</h3>
                    <span className="text-sm text-slate-500 flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {pass.duration}
                    </span>
                  </div>
                  <p className="mt-1 text-slate-600">{pass.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 5 questions to understand */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
            <MessageCircle className="h-7 w-7 text-amber-600" />
            Les 5 questions pour donner du sens
          </h2>

          <p className="text-slate-600 mb-6">
            Pour chaque nouvelle notion, pose-toi ces 5 questions. Elles t'aident à créer des connexions
            et à vraiment comprendre (pas juste mémoriser).
          </p>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[
              { question: 'Qu\'est-ce que c\'est ?', desc: 'Définis la notion avec tes propres mots' },
              { question: 'D\'où ça vient ?', desc: 'Quels prérequis ? Quel contexte historique ?' },
              { question: 'À quoi ça sert ?', desc: 'Applications pratiques et théoriques' },
              { question: 'Comment l\'utiliser ?', desc: 'Méthodes, techniques, étapes' },
              { question: 'Liens avec quoi ?', desc: 'Connexions avec d\'autres chapitres' },
            ].map((item, i) => (
              <div key={i} className="card bg-amber-50 border-amber-200">
                <h3 className="font-semibold text-amber-900">{item.question}</h3>
                <p className="mt-1 text-sm text-amber-800">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Spaced repetition */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
            <Calendar className="h-7 w-7 text-purple-600" />
            Le planning de révision espacée
          </h2>

          <p className="text-slate-600 mb-6">
            Notre mémoire oublie vite ce qu'on ne révise pas. Mais si tu révises au bon moment,
            juste avant d'oublier, tu renforces la mémoire à long terme. C'est le principe de
            la répétition espacée.
          </p>

          <div className="card">
            <div className="flex items-center gap-4 overflow-x-auto pb-2">
              {[
                { day: 'J+1', label: 'Lendemain', desc: '10 min de révision' },
                { day: 'J+3', label: '3 jours', desc: '10 min de révision' },
                { day: 'J+10', label: '10 jours', desc: '10 min de révision' },
                { day: 'J+30', label: '1 mois', desc: '15 min de révision' },
                { day: 'J+90', label: '3 mois', desc: 'Révision finale' },
              ].map((item, i, arr) => (
                <div key={i} className="flex items-center">
                  <div className="text-center min-w-[80px]">
                    <div className="h-12 w-12 mx-auto rounded-full bg-purple-100 flex items-center justify-center">
                      <span className="font-bold text-purple-700">{item.day}</span>
                    </div>
                    <p className="mt-2 text-sm font-medium text-slate-900">{item.label}</p>
                    <p className="text-xs text-slate-500">{item.desc}</p>
                  </div>
                  {i < arr.length - 1 && (
                    <div className="h-0.5 w-8 bg-purple-200 mx-2" />
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 rounded-lg bg-purple-50 border border-purple-200 p-4">
            <p className="text-purple-800 text-sm">
              <strong>Sur cette plateforme :</strong> quand tu marques une leçon comme "Maîtrisée",
              le planning de révision s'active automatiquement. Tu reçois des rappels visuels
              pour savoir quand réviser.
            </p>
          </div>
        </section>

        {/* Common mistakes */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
            <AlertTriangle className="h-7 w-7 text-danger-500" />
            Erreurs à éviter
          </h2>

          <div className="grid gap-4 md:grid-cols-2">
            {[
              {
                mistake: 'Relire passivement',
                solution: 'Reformule, explique à voix haute, fais des exercices',
              },
              {
                mistake: 'Tout apprendre d\'un coup',
                solution: 'Répartis sur plusieurs jours, respecte le planning',
              },
              {
                mistake: 'Sauter les exercices de compréhension',
                solution: 'Ils sont essentiels pour vérifier que tu as vraiment compris',
              },
              {
                mistake: 'Regarder la solution trop vite',
                solution: 'Cherche au moins 10 min, utilise les indices progressifs',
              },
              {
                mistake: 'Ne pas noter ses erreurs',
                solution: 'Tiens un carnet d\'erreurs, relis-le avant les contrôles',
              },
              {
                mistake: 'Réviser la veille du contrôle',
                solution: 'La répétition espacée est bien plus efficace',
              },
            ].map((item, i) => (
              <div key={i} className="card border-danger-200">
                <div className="flex items-start gap-3">
                  <div className="h-6 w-6 rounded-full bg-danger-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-danger-600 text-sm">✗</span>
                  </div>
                  <div>
                    <p className="font-medium text-danger-900">{item.mistake}</p>
                    <p className="mt-1 text-sm text-slate-600 flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-success-500 flex-shrink-0 mt-0.5" />
                      {item.solution}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Study routine */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
            <TrendingUp className="h-7 w-7 text-emerald-600" />
            Routine de travail recommandée
          </h2>

          <div className="card bg-emerald-50 border-emerald-200">
            <h3 className="font-semibold text-emerald-900 mb-4">Session quotidienne (30-45 min)</h3>
            <ol className="space-y-3">
              <li className="flex items-start gap-3">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-600 text-white text-sm font-medium">1</span>
                <div>
                  <p className="font-medium text-slate-900">Révision flashcards (5-10 min)</p>
                  <p className="text-sm text-slate-600">Commence par revoir les cartes dues du jour</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-600 text-white text-sm font-medium">2</span>
                <div>
                  <p className="font-medium text-slate-900">Nouvelle leçon OU exercices (20-30 min)</p>
                  <p className="text-sm text-slate-600">Alterne entre apprentissage et pratique</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-600 text-white text-sm font-medium">3</span>
                <div>
                  <p className="font-medium text-slate-900">Mini-récap (5 min)</p>
                  <p className="text-sm text-slate-600">Note ce que tu as appris, les erreurs à retenir</p>
                </div>
              </li>
            </ol>
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div className="card">
              <h3 className="font-semibold text-slate-900 mb-2">Avant un contrôle</h3>
              <ul className="space-y-1 text-sm text-slate-600">
                <li>• Relis ton carnet d'erreurs</li>
                <li>• Refais les exercices difficiles</li>
                <li>• Révise les flashcards en mode intensif</li>
                <li>• Fais un QCM blanc si disponible</li>
              </ul>
            </div>
            <div className="card">
              <h3 className="font-semibold text-slate-900 mb-2">Gestion du stress</h3>
              <ul className="space-y-1 text-sm text-slate-600">
                <li>• La régularité bat l'intensité</li>
                <li>• Dors suffisamment la veille</li>
                <li>• Fais des pauses toutes les 25 min</li>
                <li>• Aie confiance en ta préparation</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Final tips */}
        <section>
          <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
            <Lightbulb className="h-7 w-7 text-amber-500" />
            En résumé
          </h2>

          <div className="card bg-gradient-to-r from-amber-50 to-white border-amber-200">
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-success-500 flex-shrink-0 mt-0.5" />
                <p className="text-slate-700">
                  <strong>Comprendre avant de mémoriser</strong> : pose-toi les 5 questions, reformule, fais les exercices de compréhension
                </p>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-success-500 flex-shrink-0 mt-0.5" />
                <p className="text-slate-700">
                  <strong>Pratiquer régulièrement</strong> : mieux vaut 30 min par jour que 3h le week-end
                </p>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-success-500 flex-shrink-0 mt-0.5" />
                <p className="text-slate-700">
                  <strong>Réviser au bon moment</strong> : utilise le planning J+1, J+3, J+10, J+30, J+90
                </p>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-success-500 flex-shrink-0 mt-0.5" />
                <p className="text-slate-700">
                  <strong>Apprendre de ses erreurs</strong> : note-les, comprends-les, ne les refais plus
                </p>
              </li>
            </ul>
          </div>
        </section>
      </div>
    </div>
  )
}
