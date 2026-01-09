'use client'

import { useState, useMemo } from 'react'
import { MathInline } from './SvgMath'

type ReactionType = 'combustion' | 'dissolution' | 'neutralisation' | 'custom'

const predefinedReactions: Record<ReactionType, { name: string; reactants: string; products: string; deltaH: number; Ea: number }> = {
  combustion: {
    name: 'Combustion du méthane',
    reactants: 'CH₄ + 2O₂',
    products: 'CO₂ + 2H₂O',
    deltaH: -890,
    Ea: 150
  },
  dissolution: {
    name: 'Dissolution NaOH',
    reactants: 'NaOH(s)',
    products: 'Na⁺(aq) + OH⁻(aq)',
    deltaH: -44,
    Ea: 20
  },
  neutralisation: {
    name: 'Neutralisation acide-base',
    reactants: 'H⁺ + OH⁻',
    products: 'H₂O',
    deltaH: -57,
    Ea: 10
  },
  custom: {
    name: 'Réaction personnalisée',
    reactants: 'Réactifs',
    products: 'Produits',
    deltaH: -100,
    Ea: 80
  }
}

export default function ThermochimieAnimation() {
  const [reactionType, setReactionType] = useState<ReactionType>('combustion')
  const [customDeltaH, setCustomDeltaH] = useState(-100)
  const [customEa, setCustomEa] = useState(80)
  const [showActivation, setShowActivation] = useState(true)
  const [showCatalyst, setShowCatalyst] = useState(false)

  const reaction = useMemo(() => {
    if (reactionType === 'custom') {
      return { ...predefinedReactions.custom, deltaH: customDeltaH, Ea: customEa }
    }
    return predefinedReactions[reactionType]
  }, [reactionType, customDeltaH, customEa])

  const isExothermic = reaction.deltaH < 0
  const catalystEa = reaction.Ea * 0.5 // Énergie d'activation avec catalyseur

  // Dimensions du diagramme
  const svgWidth = 700
  const svgHeight = 450
  const margin = { top: 60, right: 40, bottom: 60, left: 80 }
  const chartWidth = svgWidth - margin.left - margin.right
  const chartHeight = svgHeight - margin.top - margin.bottom

  // Échelle d'énergie
  const maxEnergy = Math.max(Math.abs(reaction.deltaH), reaction.Ea) + 100
  const minEnergy = isExothermic ? reaction.deltaH - 50 : -50
  const energyRange = maxEnergy - minEnergy
  const scale = chartHeight / energyRange

  // Niveaux d'énergie
  const reactantLevel = isExothermic ? 0 : reaction.deltaH
  const productLevel = isExothermic ? reaction.deltaH : 0
  const activationLevel = reactantLevel + reaction.Ea
  const catalystActivationLevel = reactantLevel + catalystEa

  // Conversion en coordonnées SVG
  const toY = (energy: number) => margin.top + (maxEnergy - energy) * scale

  // Chemin de la courbe de réaction
  const generateReactionPath = (withCatalyst: boolean = false): string => {
    const startX = margin.left + 80
    const peakX = margin.left + chartWidth / 2
    const endX = margin.left + chartWidth - 80

    const startY = toY(reactantLevel)
    const peakY = toY(withCatalyst ? catalystActivationLevel : activationLevel)
    const endY = toY(productLevel)

    // Courbe de Bézier pour un profil réactionnel réaliste
    const cp1x = startX + (peakX - startX) * 0.5
    const cp1y = startY - Math.abs(peakY - startY) * 0.3
    const cp2x = peakX - (peakX - startX) * 0.3
    const cp2y = peakY

    const cp3x = peakX + (endX - peakX) * 0.3
    const cp3y = peakY
    const cp4x = endX - (endX - peakX) * 0.5
    const cp4y = endY + Math.abs(peakY - endY) * 0.3

    return `M ${startX} ${startY} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${peakX} ${peakY} C ${cp3x} ${cp3y}, ${cp4x} ${cp4y}, ${endX} ${endY}`
  }

  return (
    <div className="my-8 rounded-xl bg-slate-800 p-6">
      <h3 className="mb-4 text-xl font-semibold text-cyan-400">
        Thermochimie - Diagramme enthalpique
      </h3>

      {/* Zone de visualisation */}
      <div className="mb-6 rounded-lg bg-slate-900 p-4">
        <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full">
          {/* Titre */}
          <text x={svgWidth / 2} y="30" fill="#e2e8f0" fontSize="16" textAnchor="middle" fontWeight="bold">
            {reaction.name}
          </text>

          {/* Axe Y (Enthalpie) */}
          <line x1={margin.left} y1={margin.top} x2={margin.left} y2={margin.top + chartHeight} stroke="#64748b" strokeWidth="2" />
          <text x={margin.left - 10} y={margin.top - 10} fill="#94a3b8" fontSize="12" textAnchor="end">H (kJ/mol)</text>

          {/* Graduation axe Y */}
          {[-200, -100, 0, 100, 200].filter(v => v >= minEnergy && v <= maxEnergy).map(value => {
            const y = toY(value)
            return (
              <g key={value}>
                <line x1={margin.left - 5} y1={y} x2={margin.left} y2={y} stroke="#64748b" strokeWidth="1" />
                <text x={margin.left - 10} y={y + 4} fill="#94a3b8" fontSize="10" textAnchor="end">{value}</text>
              </g>
            )
          })}

          {/* Axe X (Avancement) */}
          <line x1={margin.left} y1={margin.top + chartHeight} x2={margin.left + chartWidth} y2={margin.top + chartHeight} stroke="#64748b" strokeWidth="2" />
          <text x={margin.left + chartWidth / 2} y={svgHeight - 15} fill="#94a3b8" fontSize="12" textAnchor="middle">
            Avancement de la réaction →
          </text>

          {/* Niveau des réactifs */}
          <line
            x1={margin.left}
            y1={toY(reactantLevel)}
            x2={margin.left + 100}
            y2={toY(reactantLevel)}
            stroke="#22d3ee"
            strokeWidth="3"
          />
          <text x={margin.left + 50} y={toY(reactantLevel) - 10} fill="#22d3ee" fontSize="11" textAnchor="middle">
            {reaction.reactants}
          </text>

          {/* Niveau des produits */}
          <line
            x1={margin.left + chartWidth - 100}
            y1={toY(productLevel)}
            x2={margin.left + chartWidth}
            y2={toY(productLevel)}
            stroke="#34d399"
            strokeWidth="3"
          />
          <text x={margin.left + chartWidth - 50} y={toY(productLevel) - 10} fill="#34d399" fontSize="11" textAnchor="middle">
            {reaction.products}
          </text>

          {/* Courbe de réaction avec catalyseur (si activé) */}
          {showCatalyst && (
            <path
              d={generateReactionPath(true)}
              fill="none"
              stroke="#f472b6"
              strokeWidth="2"
              strokeDasharray="8,4"
            />
          )}

          {/* Courbe de réaction principale */}
          {showActivation && (
            <path
              d={generateReactionPath(false)}
              fill="none"
              stroke="#fbbf24"
              strokeWidth="2.5"
            />
          )}

          {/* État de transition */}
          {showActivation && (
            <g transform={`translate(${margin.left + chartWidth / 2}, ${toY(activationLevel)})`}>
              <circle r="6" fill="#fbbf24" />
              <text x="15" y="5" fill="#fbbf24" fontSize="11">État de transition</text>
            </g>
          )}

          {/* État de transition avec catalyseur */}
          {showCatalyst && showActivation && (
            <g transform={`translate(${margin.left + chartWidth / 2}, ${toY(catalystActivationLevel)})`}>
              <circle r="5" fill="#f472b6" />
              <text x="15" y="5" fill="#f472b6" fontSize="10">Avec catalyseur</text>
            </g>
          )}

          {/* Flèche ΔrH */}
          <g transform={`translate(${margin.left + chartWidth - 60}, 0)`}>
            <defs>
              <marker id="arrowUp" markerWidth="8" markerHeight="6" refX="4" refY="3" orient="auto">
                <polygon points="0 6, 4 0, 8 6" fill={isExothermic ? '#ef4444' : '#22d3ee'} />
              </marker>
              <marker id="arrowDown" markerWidth="8" markerHeight="6" refX="4" refY="3" orient="auto">
                <polygon points="0 0, 4 6, 8 0" fill={isExothermic ? '#ef4444' : '#22d3ee'} />
              </marker>
            </defs>
            <line
              x1="0"
              y1={toY(reactantLevel)}
              x2="0"
              y2={toY(productLevel)}
              stroke={isExothermic ? '#ef4444' : '#22d3ee'}
              strokeWidth="2"
              markerEnd={isExothermic ? 'url(#arrowDown)' : 'url(#arrowUp)'}
            />
            <text
              x="10"
              y={(toY(reactantLevel) + toY(productLevel)) / 2}
              fill={isExothermic ? '#ef4444' : '#22d3ee'}
              fontSize="12"
              fontWeight="bold"
            >
              ΔrH = {reaction.deltaH} kJ/mol
            </text>
          </g>

          {/* Flèche Ea */}
          {showActivation && (
            <g transform={`translate(${margin.left + 130}, 0)`}>
              <line
                x1="0"
                y1={toY(reactantLevel)}
                x2="0"
                y2={toY(activationLevel)}
                stroke="#fbbf24"
                strokeWidth="2"
                strokeDasharray="4,2"
              />
              <text x="10" y={(toY(reactantLevel) + toY(activationLevel)) / 2} fill="#fbbf24" fontSize="11">
                Ea = {reaction.Ea} kJ/mol
              </text>
            </g>
          )}

          {/* Flèche Ea avec catalyseur */}
          {showCatalyst && showActivation && (
            <g transform={`translate(${margin.left + 170}, 0)`}>
              <line
                x1="0"
                y1={toY(reactantLevel)}
                x2="0"
                y2={toY(catalystActivationLevel)}
                stroke="#f472b6"
                strokeWidth="2"
                strokeDasharray="4,2"
              />
              <text x="10" y={(toY(reactantLevel) + toY(catalystActivationLevel)) / 2} fill="#f472b6" fontSize="10">
                Ea&apos; = {catalystEa.toFixed(0)} kJ/mol
              </text>
            </g>
          )}

          {/* Indication exo/endothermique */}
          <g transform={`translate(${svgWidth - 150}, ${svgHeight - 50})`}>
            <rect x="0" y="0" width="130" height="35" rx="5" fill={isExothermic ? 'rgba(239, 68, 68, 0.2)' : 'rgba(34, 211, 238, 0.2)'} stroke={isExothermic ? '#ef4444' : '#22d3ee'} />
            <text x="65" y="22" fill={isExothermic ? '#ef4444' : '#22d3ee'} fontSize="12" textAnchor="middle" fontWeight="bold">
              {isExothermic ? '🔥 Exothermique' : '❄️ Endothermique'}
            </text>
          </g>

          {/* Légende */}
          <g transform={`translate(${margin.left + 20}, ${svgHeight - 50})`}>
            <line x1="0" y1="0" x2="20" y2="0" stroke="#fbbf24" strokeWidth="2" />
            <text x="25" y="4" fill="#94a3b8" fontSize="10">Profil réactionnel</text>
            {showCatalyst && (
              <>
                <line x1="120" y1="0" x2="140" y2="0" stroke="#f472b6" strokeWidth="2" strokeDasharray="4,2" />
                <text x="145" y="4" fill="#94a3b8" fontSize="10">Avec catalyseur</text>
              </>
            )}
          </g>
        </svg>
      </div>

      {/* Contrôles */}
      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Type de réaction */}
        <div className="rounded-lg bg-slate-700/50 p-4">
          <label className="mb-2 block text-sm text-slate-300">Type de réaction</label>
          <select
            value={reactionType}
            onChange={(e) => setReactionType(e.target.value as ReactionType)}
            className="w-full rounded bg-slate-600 px-3 py-2 text-sm text-white"
          >
            <option value="combustion">Combustion CH₄</option>
            <option value="dissolution">Dissolution NaOH</option>
            <option value="neutralisation">Neutralisation</option>
            <option value="custom">Personnalisée</option>
          </select>
        </div>

        {/* ΔrH personnalisé */}
        {reactionType === 'custom' && (
          <div className="rounded-lg bg-slate-700/50 p-4">
            <label className="mb-2 flex items-center justify-between text-sm text-slate-300">
              <span>ΔrH</span>
              <span className={customDeltaH < 0 ? 'text-red-400' : 'text-cyan-400'}>{customDeltaH} kJ/mol</span>
            </label>
            <input
              type="range"
              min="-300"
              max="300"
              value={customDeltaH}
              onChange={(e) => setCustomDeltaH(Number(e.target.value))}
              className="w-full accent-red-500"
            />
          </div>
        )}

        {/* Ea personnalisé */}
        {reactionType === 'custom' && (
          <div className="rounded-lg bg-slate-700/50 p-4">
            <label className="mb-2 flex items-center justify-between text-sm text-slate-300">
              <span>Énergie d&apos;activation Ea</span>
              <span className="text-yellow-400">{customEa} kJ/mol</span>
            </label>
            <input
              type="range"
              min="10"
              max="200"
              value={customEa}
              onChange={(e) => setCustomEa(Number(e.target.value))}
              className="w-full accent-yellow-500"
            />
          </div>
        )}

        {/* Options */}
        <div className="rounded-lg bg-slate-700/50 p-4">
          <label className="mb-2 block text-sm text-slate-300">Options</label>
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm text-slate-300">
              <input
                type="checkbox"
                checked={showActivation}
                onChange={(e) => setShowActivation(e.target.checked)}
                className="rounded accent-yellow-500"
              />
              Énergie d&apos;activation
            </label>
            <label className="flex items-center gap-2 text-sm text-slate-300">
              <input
                type="checkbox"
                checked={showCatalyst}
                onChange={(e) => setShowCatalyst(e.target.checked)}
                className="rounded accent-pink-500"
              />
              Effet du catalyseur
            </label>
          </div>
        </div>
      </div>

      {/* Grandeurs */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <div className="rounded-lg bg-slate-700/50 p-3 text-center">
          <div className="text-xs text-slate-400">Enthalpie de réaction</div>
          <div className={`text-lg font-bold ${isExothermic ? 'text-red-400' : 'text-cyan-400'}`}>
            {reaction.deltaH} kJ/mol
          </div>
        </div>
        <div className="rounded-lg bg-slate-700/50 p-3 text-center">
          <div className="text-xs text-slate-400">Énergie d&apos;activation</div>
          <div className="text-lg font-bold text-yellow-400">{reaction.Ea} kJ/mol</div>
        </div>
        <div className="rounded-lg bg-slate-700/50 p-3 text-center">
          <div className="text-xs text-slate-400">Ea avec catalyseur</div>
          <div className="text-lg font-bold text-pink-400">{catalystEa.toFixed(0)} kJ/mol</div>
        </div>
        <div className="rounded-lg bg-slate-700/50 p-3 text-center">
          <div className="text-xs text-slate-400">Type</div>
          <div className={`text-lg font-bold ${isExothermic ? 'text-red-400' : 'text-cyan-400'}`}>
            {isExothermic ? 'Exothermique' : 'Endothermique'}
          </div>
        </div>
      </div>

      {/* Formules */}
      <div className="mt-6 rounded-lg bg-slate-900/50 p-4">
        <h4 className="mb-3 text-sm font-semibold text-slate-300">Thermochimie - Formules</h4>
        <div className="grid grid-cols-1 gap-3 text-sm md:grid-cols-2">
          <div className="rounded bg-slate-800 p-3">
            <div className="mb-1 text-slate-400">Enthalpie de réaction :</div>
            <div className="text-cyan-400"><MathInline>{String.raw`\Delta_r H = \sum \Delta_f H(\text{produits}) - \sum \Delta_f H(\text{réactifs})`}</MathInline></div>
          </div>
          <div className="rounded bg-slate-800 p-3">
            <div className="mb-1 text-slate-400">Loi de Hess :</div>
            <div className="text-emerald-400"><MathInline>{String.raw`\Delta_r H = \sum \nu_i \Delta_f H_i`}</MathInline></div>
          </div>
          <div className="rounded bg-slate-800 p-3">
            <div className="mb-1 text-slate-400">Énergie d&apos;activation :</div>
            <div className="text-yellow-400"><MathInline>{String.raw`k = A \cdot e^{-E_a/(RT)}`}</MathInline> (Arrhenius)</div>
          </div>
          <div className="rounded bg-slate-800 p-3">
            <div className="mb-1 text-slate-400">Chaleur échangée :</div>
            <div className="text-orange-400"><MathInline>{String.raw`Q = n \cdot \Delta_r H`}</MathInline></div>
          </div>
        </div>
      </div>
    </div>
  )
}
