import { RandomExerciseTemplate, GeneratedExercise, SolutionStep } from '@/types'

// Générateur de nombres pseudo-aléatoires avec seed
function seededRandom(seed: number): () => number {
  return function() {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff
    return seed / 0x7fffffff
  }
}

// Génère une valeur aléatoire selon la définition
function generateValue(
  definition: RandomExerciseTemplate['variables'][string],
  random: () => number
): number | string {
  if (definition.type === 'choice' && definition.choices) {
    const index = Math.floor(random() * definition.choices.length)
    return definition.choices[index]
  }

  const min = definition.min ?? 0
  const max = definition.max ?? 100
  const range = max - min

  if (definition.type === 'integer') {
    return Math.floor(random() * (range + 1)) + min
  }

  // type === 'number'
  const decimals = definition.decimals ?? 2
  const value = random() * range + min
  return Number(value.toFixed(decimals))
}

// Évalue une expression mathématique avec les variables
function evaluateExpression(
  expression: string,
  values: Record<string, number | string>
): number {
  try {
    // Remplacer les variables par leurs valeurs
    let expr = expression
    for (const [name, value] of Object.entries(values)) {
      const regex = new RegExp(`\\b${name}\\b`, 'g')
      expr = expr.replace(regex, typeof value === 'number' ? value.toString() : `"${value}"`)
    }
    // Évaluer l'expression
    // eslint-disable-next-line no-eval
    const result = eval(expr)
    return typeof result === 'number' ? result : parseFloat(result)
  } catch {
    console.error(`Erreur d'évaluation: ${expression}`, values)
    return 0
  }
}

// Formate un nombre pour l'affichage
function formatNumber(value: number, maxDecimals: number = 3): string {
  if (Number.isInteger(value)) {
    return value.toString()
  }

  // Gestion des très grands ou très petits nombres
  if (Math.abs(value) >= 1e6 || (Math.abs(value) < 1e-3 && value !== 0)) {
    return value.toExponential(2)
  }

  // Arrondir à maxDecimals décimales significatives
  const rounded = Number(value.toPrecision(maxDecimals + 1))
  return rounded.toFixed(maxDecimals).replace(/\.?0+$/, '')
}

// Remplace les variables dans un template de texte
function replaceVariables(
  template: string,
  values: Record<string, number | string>,
  computed: Record<string, number | string>
): string {
  let result = template
  const allValues = { ...values, ...computed }

  // Remplacer {{variable}} par sa valeur
  for (const [name, value] of Object.entries(allValues)) {
    const regex = new RegExp(`\\{\\{${name}\\}\\}`, 'g')
    const formatted = typeof value === 'number' ? formatNumber(value) : value
    result = result.replace(regex, formatted)
  }

  return result
}

// Génère un exercice à partir d'un template
export function generateExercise(
  template: RandomExerciseTemplate,
  seed?: number
): GeneratedExercise {
  const actualSeed = seed ?? Date.now()
  const random = seededRandom(actualSeed)

  // Générer les valeurs des variables
  const values: Record<string, number | string> = {}
  for (const [name, definition] of Object.entries(template.variables)) {
    values[name] = generateValue(definition, random)
  }

  // Calculer les valeurs intermédiaires
  const computed: Record<string, number | string> = {}

  for (const step of template.solutionSteps) {
    if (step.compute) {
      for (const [name, expression] of Object.entries(step.compute)) {
        // Vérifier si c'est une expression conditionnelle (contient '?')
        if (expression.includes('?') && expression.includes(':')) {
          // Expression ternaire - évaluer directement
          const result = evaluateExpression(expression, { ...values, ...computed })
          computed[name] = typeof result === 'number' && !isNaN(result)
            ? result
            : expression.split('?')[1].split(':')[0].trim().replace(/'/g, '')
        } else {
          computed[name] = evaluateExpression(expression, { ...values, ...computed })
        }
      }
    }
  }

  // Ajouter la direction pour l'exercice d'équilibre
  if (computed['Qr'] !== undefined && values['K'] !== undefined) {
    const Qr = computed['Qr'] as number
    const K = values['K'] as number
    computed['direction'] = Qr < K ? 'sens direct (→)' : (Qr > K ? 'sens inverse (←)' : 'équilibre')
  }

  // Générer l'énoncé
  const statement = replaceVariables(template.statement, values, computed)

  // Générer les étapes de solution
  const solutionSteps: SolutionStep[] = template.solutionSteps.map(step => ({
    step: step.step,
    title: step.title,
    content: replaceVariables(step.content, values, computed),
    explanation: step.explanation
  }))

  // Générer la réponse finale
  const finalAnswer = replaceVariables(template.finalAnswer, values, computed)

  // Générer les hints
  const hints = template.hints.map(hint => replaceVariables(hint, values, computed))

  return {
    templateId: template.id,
    lessonId: template.lessonId,
    title: template.title,
    difficulty: template.difficulty,
    values,
    computed,
    statement,
    solutionSteps,
    finalAnswer,
    method: template.method,
    hints,
    seed: actualSeed
  }
}

// Régénère un exercice avec un nouveau seed
export function regenerateExercise(
  template: RandomExerciseTemplate
): GeneratedExercise {
  return generateExercise(template, Date.now() + Math.random() * 1000)
}

// Charge les templates depuis le JSON
export async function loadTemplates(): Promise<RandomExerciseTemplate[]> {
  const response = await fetch('/api/random-exercises')
  if (!response.ok) {
    throw new Error('Erreur lors du chargement des templates')
  }
  return response.json()
}

// Obtient les templates pour une leçon spécifique
export function getTemplatesForLesson(
  templates: RandomExerciseTemplate[],
  lessonId: string
): RandomExerciseTemplate[] {
  return templates.filter(t => t.lessonId === lessonId)
}

// Obtient tous les lessonIds uniques
export function getUniqueLessonIds(templates: RandomExerciseTemplate[]): string[] {
  return Array.from(new Set(templates.map(t => t.lessonId)))
}
