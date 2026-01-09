'use client'

import React, { useState, useMemo } from 'react'
import { MathInline, MathBlock } from './SvgMath'

interface TitrageType {
  name: string
  acideName: string
  baseName: string
  Ca: number  // Concentration acide
  Cb: number  // Concentration base
  pKa: number // pKa de l'acide
  Va: number  // Volume acide initial
  isStrongAcid: boolean
  reaction: string
}

const titrageTypes: TitrageType[] = [
  {
    name: 'Acide fort / Base forte',
    acideName: 'HCl',
    baseName: 'NaOH',
    Ca: 0.1,
    Cb: 0.1,
    pKa: -7,
    Va: 20,
    isStrongAcid: true,
    reaction: String.raw`\text{HCl} + \text{NaOH} \rightarrow \text{NaCl} + \text{H}_2\text{O}`
  },
  {
    name: 'Acide faible / Base forte',
    acideName: 'CH₃COOH',
    baseName: 'NaOH',
    Ca: 0.1,
    Cb: 0.1,
    pKa: 4.75,
    Va: 20,
    isStrongAcid: false,
    reaction: String.raw`\text{CH}_3\text{COOH} + \text{OH}^- \rightarrow \text{CH}_3\text{COO}^- + \text{H}_2\text{O}`
  },
  {
    name: 'Acide phosphorique (polyacide)',
    acideName: 'H₃PO₄',
    baseName: 'NaOH',
    Ca: 0.1,
    Cb: 0.1,
    pKa: 2.15,
    Va: 20,
    isStrongAcid: false,
    reaction: String.raw`\text{H}_3\text{PO}_4 + 3\text{OH}^- \rightarrow \text{PO}_4^{3-} + 3\text{H}_2\text{O}`
  }
]

export default function TitragesAnimation() {
  const [selectedType, setSelectedType] = useState(0)
  const [volumeAdded, setVolumeAdded] = useState(0)
  const [showDerivative, setShowDerivative] = useState(true)
  const [showIndicator, setShowIndicator] = useState(true)

  const titrage = titrageTypes[selectedType]
  const Veq = (titrage.Ca * titrage.Va) / titrage.Cb

  // Calcul du pH en fonction du volume de base ajouté
  const calculatePH = (Vb: number): number => {
    const { Ca, Cb, Va, pKa, isStrongAcid } = titrage
    const naInitial = Ca * Va / 1000
    const nbAdded = Cb * Vb / 1000
    const Vtotal = Va + Vb

    if (Vb === 0) {
      if (isStrongAcid) {
        return -Math.log10(Ca)
      } else {
        // pH acide faible
        const h = Math.sqrt(Math.pow(10, -pKa) * Ca)
        return -Math.log10(h)
      }
    }

    if (Math.abs(Vb - Veq) < 0.01) {
      // Point d'équivalence
      if (isStrongAcid) {
        return 7
      } else {
        // Solution de base faible
        const Cbase = naInitial / (Vtotal / 1000)
        const Kb = Math.pow(10, -(14 - pKa))
        const oh = Math.sqrt(Kb * Cbase)
        return 14 + Math.log10(oh)
      }
    }

    if (Vb < Veq) {
      // Avant l'équivalence
      const naRestant = naInitial - nbAdded
      if (isStrongAcid) {
        const h = (naRestant * 1000) / Vtotal
        return -Math.log10(Math.max(h, 1e-14))
      } else {
        // Zone tampon: pH = pKa + log([A-]/[AH])
        const nAmoins = nbAdded
        if (nAmoins <= 0) {
          const h = Math.sqrt(Math.pow(10, -pKa) * (naRestant * 1000 / Vtotal))
          return -Math.log10(h)
        }
        return pKa + Math.log10(nAmoins / naRestant)
      }
    } else {
      // Après l'équivalence - excès de base
      const nbExces = nbAdded - naInitial
      const oh = (nbExces * 1000) / Vtotal
      return 14 + Math.log10(Math.max(oh, 1e-14))
    }
  }

  // Génération des points de la courbe
  const curvePoints = useMemo(() => {
    const points: { x: number; y: number }[] = []
    const maxV = Veq * 2
    for (let v = 0; v <= maxV; v += 0.1) {
      const pH = calculatePH(v)
      if (pH >= 0 && pH <= 14) {
        points.push({ x: v, y: pH })
      }
    }
    return points
  }, [selectedType, Veq])

  // Calcul de la dérivée pour trouver le point d'équivalence
  const derivativePoints = useMemo(() => {
    const points: { x: number; y: number }[] = []
    const maxV = Veq * 2
    const step = 0.1
    let maxDeriv = 0

    for (let v = step; v <= maxV - step; v += step) {
      const pH1 = calculatePH(v - step)
      const pH2 = calculatePH(v + step)
      const deriv = Math.abs((pH2 - pH1) / (2 * step))
      if (deriv > maxDeriv) maxDeriv = deriv
      points.push({ x: v, y: deriv })
    }

    // Normaliser
    return points.map(p => ({ x: p.x, y: (p.y / maxDeriv) * 10 }))
  }, [selectedType, Veq])

  const currentPH = calculatePH(volumeAdded)

  // Couleur de l'indicateur (phénolphtaléine: incolore < 8.2, rose > 10)
  const getIndicatorColor = (pH: number): string => {
    if (pH < 8.2) return 'rgba(255, 255, 255, 0.8)'
    if (pH > 10) return 'rgba(255, 0, 128, 0.6)'
    const ratio = (pH - 8.2) / 1.8
    return `rgba(255, ${Math.round(255 * (1 - ratio))}, ${Math.round(128 + 127 * (1 - ratio))}, ${0.5 + ratio * 0.3})`
  }

  // Transformation SVG
  const maxV = Veq * 2
  const svgWidth = 500
  const svgHeight = 350
  const margin = { top: 20, right: 30, bottom: 50, left: 50 }
  const plotWidth = svgWidth - margin.left - margin.right
  const plotHeight = svgHeight - margin.top - margin.bottom

  const xScale = (v: number) => margin.left + (v / maxV) * plotWidth
  const yScale = (pH: number) => margin.top + plotHeight - (pH / 14) * plotHeight

  // Chemin de la courbe
  const curvePath = curvePoints
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${xScale(p.x).toFixed(1)} ${yScale(p.y).toFixed(1)}`)
    .join(' ')

  const derivativePath = derivativePoints
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${xScale(p.x).toFixed(1)} ${yScale(p.y).toFixed(1)}`)
    .join(' ')

  return (
    <div className="p-4 bg-gray-900 rounded-xl">
      <h3 className="text-lg font-semibold text-white mb-4">Simulation de Titrage</h3>

      {/* Sélection du type de titrage */}
      <div className="mb-4 flex flex-wrap gap-2">
        {titrageTypes.map((type, index) => (
          <button
            key={index}
            onClick={() => {
              setSelectedType(index)
              setVolumeAdded(0)
            }}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              selectedType === index
                ? 'bg-purple-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            {type.name}
          </button>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {/* Graphique */}
        <div className="bg-gray-800 rounded-lg p-4">
          <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-auto">
            {/* Grille */}
            {[0, 2, 4, 6, 7, 8, 10, 12, 14].map(pH => (
              <g key={pH}>
                <line
                  x1={margin.left}
                  y1={yScale(pH)}
                  x2={svgWidth - margin.right}
                  y2={yScale(pH)}
                  stroke={pH === 7 ? '#4ade80' : '#374151'}
                  strokeWidth={pH === 7 ? 1 : 0.5}
                  strokeDasharray={pH === 7 ? '4,4' : 'none'}
                />
                <text
                  x={margin.left - 10}
                  y={yScale(pH)}
                  textAnchor="end"
                  dominantBaseline="middle"
                  fill="#9ca3af"
                  fontSize="12"
                >
                  {pH}
                </text>
              </g>
            ))}

            {/* Axe X */}
            {[0, 0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2].map(ratio => {
              const v = ratio * Veq
              return (
                <g key={ratio}>
                  <line
                    x1={xScale(v)}
                    y1={margin.top}
                    x2={xScale(v)}
                    y2={svgHeight - margin.bottom}
                    stroke="#374151"
                    strokeWidth={0.5}
                  />
                  <text
                    x={xScale(v)}
                    y={svgHeight - margin.bottom + 20}
                    textAnchor="middle"
                    fill="#9ca3af"
                    fontSize="11"
                  >
                    {v.toFixed(1)}
                  </text>
                </g>
              )
            })}

            {/* Labels des axes */}
            <text
              x={svgWidth / 2}
              y={svgHeight - 5}
              textAnchor="middle"
              fill="#d1d5db"
              fontSize="13"
            >
              Volume de {titrage.baseName} ajouté (mL)
            </text>
            <text
              x={15}
              y={svgHeight / 2}
              textAnchor="middle"
              fill="#d1d5db"
              fontSize="13"
              transform={`rotate(-90, 15, ${svgHeight / 2})`}
            >
              pH
            </text>

            {/* Courbe de titrage */}
            <path
              d={curvePath}
              fill="none"
              stroke="#8b5cf6"
              strokeWidth={2.5}
            />

            {/* Courbe dérivée */}
            {showDerivative && (
              <path
                d={derivativePath}
                fill="none"
                stroke="#f97316"
                strokeWidth={1.5}
                strokeDasharray="4,2"
                opacity={0.7}
              />
            )}

            {/* Ligne verticale équivalence */}
            <line
              x1={xScale(Veq)}
              y1={margin.top}
              x2={xScale(Veq)}
              y2={svgHeight - margin.bottom}
              stroke="#ef4444"
              strokeWidth={1.5}
              strokeDasharray="6,3"
            />
            <text
              x={xScale(Veq)}
              y={margin.top - 5}
              textAnchor="middle"
              fill="#ef4444"
              fontSize="11"
              fontWeight="bold"
            >
              Veq = {Veq.toFixed(1)} mL
            </text>

            {/* Point courant */}
            <circle
              cx={xScale(volumeAdded)}
              cy={yScale(currentPH)}
              r={6}
              fill="#22d3ee"
              stroke="#fff"
              strokeWidth={2}
            />

            {/* Zone tampon (pour acide faible) */}
            {!titrage.isStrongAcid && (
              <rect
                x={xScale(Veq * 0.1)}
                y={yScale(titrage.pKa + 1)}
                width={xScale(Veq * 0.9) - xScale(Veq * 0.1)}
                height={yScale(titrage.pKa - 1) - yScale(titrage.pKa + 1)}
                fill="rgba(168, 85, 247, 0.15)"
                stroke="#a855f7"
                strokeWidth={1}
                strokeDasharray="4,2"
              />
            )}

            {/* Légende */}
            <g transform={`translate(${svgWidth - margin.right - 120}, ${margin.top + 10})`}>
              <rect x={0} y={0} width={115} height={showDerivative ? 50 : 30} fill="rgba(0,0,0,0.5)" rx={4} />
              <line x1={5} y1={12} x2={25} y2={12} stroke="#8b5cf6" strokeWidth={2} />
              <text x={30} y={16} fill="#d1d5db" fontSize="10">Courbe pH</text>
              {showDerivative && (
                <>
                  <line x1={5} y1={32} x2={25} y2={32} stroke="#f97316" strokeWidth={1.5} strokeDasharray="4,2" />
                  <text x={30} y={36} fill="#d1d5db" fontSize="10">dpH/dV</text>
                </>
              )}
            </g>
          </svg>
        </div>

        {/* Contrôles et informations */}
        <div className="space-y-4">
          {/* Burette visuelle */}
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="flex items-center gap-4">
              <div className="relative w-8 h-40 bg-gray-700 rounded-b-lg border-2 border-gray-500">
                {/* Graduations */}
                {[0, 25, 50, 75, 100].map(pct => (
                  <div
                    key={pct}
                    className="absolute left-full ml-1 text-xs text-gray-400"
                    style={{ bottom: `${pct}%`, transform: 'translateY(50%)' }}
                  >
                    {((100 - pct) / 100 * maxV).toFixed(0)}
                  </div>
                ))}
                {/* Niveau de liquide */}
                <div
                  className="absolute bottom-0 left-0 right-0 bg-blue-400 rounded-b transition-all duration-300"
                  style={{ height: `${Math.max(0, 100 - (volumeAdded / maxV) * 100)}%` }}
                />
                {/* Goutte */}
                <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2">
                  <div className="w-2 h-3 bg-blue-400 rounded-b-full" />
                </div>
              </div>

              {/* Bécher avec solution */}
              <div className="flex-1">
                <div
                  className="relative w-full h-32 rounded-b-2xl border-2 border-gray-500 overflow-hidden"
                  style={{ borderTop: 'none' }}
                >
                  <div
                    className="absolute bottom-0 left-0 right-0 transition-colors duration-500"
                    style={{
                      height: '70%',
                      backgroundColor: showIndicator ? getIndicatorColor(currentPH) : 'rgba(200, 200, 255, 0.3)'
                    }}
                  />
                </div>
                <p className="text-center text-sm text-gray-400 mt-1">
                  {titrage.acideName} ({titrage.Va} mL, {titrage.Ca} M)
                </p>
              </div>
            </div>
          </div>

          {/* Slider de volume */}
          <div className="bg-gray-800 rounded-lg p-4">
            <label className="block text-sm text-gray-300 mb-2">
              Volume de {titrage.baseName} ajouté: <span className="text-cyan-400 font-bold">{volumeAdded.toFixed(1)} mL</span>
            </label>
            <input
              type="range"
              min={0}
              max={maxV}
              step={0.1}
              value={volumeAdded}
              onChange={(e) => setVolumeAdded(parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
            />

            <div className="mt-3 p-3 bg-gray-700 rounded-lg">
              <p className="text-lg font-bold" style={{ color: currentPH < 7 ? '#f87171' : currentPH > 7 ? '#60a5fa' : '#4ade80' }}>
                pH = {currentPH.toFixed(2)}
              </p>
              <p className="text-sm text-gray-400 mt-1">
                {volumeAdded < Veq - 0.5 && 'Avant l\'équivalence'}
                {volumeAdded >= Veq - 0.5 && volumeAdded <= Veq + 0.5 && '≈ Point d\'équivalence'}
                {volumeAdded > Veq + 0.5 && 'Après l\'équivalence'}
              </p>
            </div>
          </div>

          {/* Options */}
          <div className="flex gap-4">
            <label className="flex items-center gap-2 text-sm text-gray-300">
              <input
                type="checkbox"
                checked={showDerivative}
                onChange={(e) => setShowDerivative(e.target.checked)}
                className="rounded bg-gray-700 border-gray-600 text-purple-500 focus:ring-purple-500"
              />
              Afficher dpH/dV
            </label>
            <label className="flex items-center gap-2 text-sm text-gray-300">
              <input
                type="checkbox"
                checked={showIndicator}
                onChange={(e) => setShowIndicator(e.target.checked)}
                className="rounded bg-gray-700 border-gray-600 text-purple-500 focus:ring-purple-500"
              />
              Phénolphtaléine
            </label>
          </div>
        </div>
      </div>

      {/* Formules et informations */}
      <div className="mt-4 grid md:grid-cols-2 gap-4">
        <div className="bg-gray-800 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-purple-400 mb-2">Réaction de titrage</h4>
          <MathBlock>{titrage.reaction}</MathBlock>

          <h4 className="text-sm font-semibold text-purple-400 mt-3 mb-2">À l'équivalence</h4>
          <MathBlock>{String.raw`n_{\text{acide}} = n_{\text{base}} \Rightarrow C_a \cdot V_a = C_b \cdot V_{eq}`}</MathBlock>
          <p className="text-sm text-gray-300 mt-2">
            <MathInline>{`V_{eq} = \\frac{C_a \\cdot V_a}{C_b} = \\frac{${titrage.Ca} \\times ${titrage.Va}}{${titrage.Cb}} = ${Veq.toFixed(1)} \\text{ mL}`}</MathInline>
          </p>
        </div>

        <div className="bg-gray-800 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-cyan-400 mb-2">Méthodes de détermination de Veq</h4>
          <ul className="text-sm text-gray-300 space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-orange-400">•</span>
              <span><strong>Méthode des tangentes:</strong> intersection au point d'inflexion</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-orange-400">•</span>
              <span><strong>Méthode de la dérivée:</strong> maximum de <MathInline>{String.raw`\frac{d(\text{pH})}{dV}`}</MathInline></span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-orange-400">•</span>
              <span><strong>Indicateur coloré:</strong> virage au point d'équivalence</span>
            </li>
          </ul>

          {!titrage.isStrongAcid && (
            <div className="mt-3 p-2 bg-purple-900/30 rounded border border-purple-700">
              <p className="text-sm text-purple-300">
                <strong>Zone tampon:</strong> pH ≈ pKa ± 1 = {(titrage.pKa - 1).toFixed(1)} à {(titrage.pKa + 1).toFixed(1)}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                À la demi-équivalence: pH = pKa = {titrage.pKa}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
