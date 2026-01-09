'use client'

import React, { useState, useEffect, useRef } from 'react'
import { MathInline, MathBlock } from './SvgMath'

interface Molecule {
  id: number
  x: number
  y: number
  type: 'H3O+' | 'OH-' | 'H2O' | 'HA' | 'A-'
  vx: number
  vy: number
}

interface Solution {
  name: string
  formula: string
  pH: number
  pKa?: number
  description: string
  color: string
}

const solutions: Solution[] = [
  { name: 'Acide chlorhydrique', formula: 'HCl', pH: 1, description: 'Acide fort', color: '#ef4444' },
  { name: 'Acide acétique', formula: 'CH₃COOH', pH: 2.9, pKa: 4.75, description: 'Acide faible', color: '#f97316' },
  { name: 'Jus de citron', formula: 'Citrique', pH: 2.5, description: 'Acide faible', color: '#fbbf24' },
  { name: 'Vinaigre', formula: 'CH₃COOH', pH: 3, pKa: 4.75, description: 'Acide faible', color: '#f59e0b' },
  { name: 'Café', formula: '-', pH: 5, description: 'Légèrement acide', color: '#92400e' },
  { name: 'Eau pure', formula: 'H₂O', pH: 7, description: 'Neutre', color: '#3b82f6' },
  { name: 'Sang', formula: '-', pH: 7.4, description: 'Légèrement basique', color: '#dc2626' },
  { name: 'Bicarbonate', formula: 'NaHCO₃', pH: 8.4, description: 'Base faible', color: '#10b981' },
  { name: 'Ammoniaque', formula: 'NH₃', pH: 11.5, pKa: 9.25, description: 'Base faible', color: '#14b8a6' },
  { name: 'Soude', formula: 'NaOH', pH: 14, description: 'Base forte', color: '#8b5cf6' },
]

export default function AcidesBasesAnimation() {
  const [selectedPH, setSelectedPH] = useState(7)
  const [showMolecules, setShowMolecules] = useState(true)
  const [isAnimating, setIsAnimating] = useState(true)
  const [showReaction, setShowReaction] = useState(false)
  const [molecules, setMolecules] = useState<Molecule[]>([])
  const animationRef = useRef<number>()

  // Calcul des concentrations
  const hConcentration = Math.pow(10, -selectedPH)
  const ohConcentration = Math.pow(10, -(14 - selectedPH))

  // Génération des molécules basée sur le pH
  useEffect(() => {
    if (!showMolecules) return

    const newMolecules: Molecule[] = []
    let id = 0

    // Nombre de molécules basé sur les concentrations relatives
    const logH = -selectedPH
    const logOH = -(14 - selectedPH)

    // Normaliser pour l'affichage (max ~20 molécules de chaque type)
    const hCount = Math.max(1, Math.min(25, Math.round(Math.pow(10, (logH + 7) / 2))))
    const ohCount = Math.max(1, Math.min(25, Math.round(Math.pow(10, (logOH + 7) / 2))))
    const h2oCount = 15

    // Molécules H3O+
    for (let i = 0; i < hCount; i++) {
      newMolecules.push({
        id: id++,
        x: Math.random() * 280 + 10,
        y: Math.random() * 180 + 10,
        type: 'H3O+',
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2
      })
    }

    // Molécules OH-
    for (let i = 0; i < ohCount; i++) {
      newMolecules.push({
        id: id++,
        x: Math.random() * 280 + 10,
        y: Math.random() * 180 + 10,
        type: 'OH-',
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2
      })
    }

    // Molécules H2O (toujours présentes)
    for (let i = 0; i < h2oCount; i++) {
      newMolecules.push({
        id: id++,
        x: Math.random() * 280 + 10,
        y: Math.random() * 180 + 10,
        type: 'H2O',
        vx: (Math.random() - 0.5) * 1.5,
        vy: (Math.random() - 0.5) * 1.5
      })
    }

    setMolecules(newMolecules)
  }, [selectedPH, showMolecules])

  // Animation des molécules
  useEffect(() => {
    if (!isAnimating || !showMolecules) return

    const animate = () => {
      setMolecules(prev => prev.map(mol => {
        let newX = mol.x + mol.vx
        let newY = mol.y + mol.vy
        let newVx = mol.vx
        let newVy = mol.vy

        // Rebond sur les bords
        if (newX < 10 || newX > 290) {
          newVx = -newVx
          newX = Math.max(10, Math.min(290, newX))
        }
        if (newY < 10 || newY > 190) {
          newVy = -newVy
          newY = Math.max(10, Math.min(190, newY))
        }

        return { ...mol, x: newX, y: newY, vx: newVx, vy: newVy }
      }))

      animationRef.current = requestAnimationFrame(animate)
    }

    animationRef.current = requestAnimationFrame(animate)
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [isAnimating, showMolecules])

  // Couleur basée sur le pH
  const getPHColor = (pH: number): string => {
    if (pH < 3) return '#ef4444'
    if (pH < 5) return '#f97316'
    if (pH < 6) return '#eab308'
    if (pH < 7) return '#84cc16'
    if (pH === 7) return '#22c55e'
    if (pH < 9) return '#14b8a6'
    if (pH < 11) return '#3b82f6'
    if (pH < 13) return '#6366f1'
    return '#8b5cf6'
  }

  // Trouver la solution la plus proche
  const closestSolution = solutions.reduce((prev, curr) =>
    Math.abs(curr.pH - selectedPH) < Math.abs(prev.pH - selectedPH) ? curr : prev
  )

  const getMoleculeColor = (type: string): string => {
    switch (type) {
      case 'H3O+': return '#ef4444'
      case 'OH-': return '#3b82f6'
      case 'H2O': return '#94a3b8'
      case 'HA': return '#f97316'
      case 'A-': return '#8b5cf6'
      default: return '#fff'
    }
  }

  return (
    <div className="p-4 bg-gray-900 rounded-xl">
      <h3 className="text-lg font-semibold text-white mb-4">Acides, Bases et Échelle de pH</h3>

      {/* Échelle de pH interactive */}
      <div className="mb-6">
        <div className="relative h-16 rounded-lg overflow-hidden mb-2"
          style={{
            background: 'linear-gradient(to right, #ef4444, #f97316, #eab308, #84cc16, #22c55e, #14b8a6, #3b82f6, #6366f1, #8b5cf6)'
          }}
        >
          {/* Marqueurs */}
          {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14].map(pH => (
            <div
              key={pH}
              className="absolute top-0 bottom-0 flex flex-col items-center justify-end pb-1"
              style={{ left: `${(pH / 14) * 100}%`, transform: 'translateX(-50%)' }}
            >
              <div className="h-3 w-0.5 bg-white/50" />
              <span className="text-xs font-bold text-white drop-shadow-lg">{pH}</span>
            </div>
          ))}

          {/* Indicateur de position */}
          <div
            className="absolute top-0 h-full w-1 bg-white shadow-lg transition-all duration-200"
            style={{ left: `${(selectedPH / 14) * 100}%`, transform: 'translateX(-50%)' }}
          >
            <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-white text-gray-900 px-2 py-0.5 rounded text-sm font-bold">
              pH {selectedPH.toFixed(1)}
            </div>
          </div>

          {/* Labels */}
          <div className="absolute top-1 left-2 text-white text-sm font-bold drop-shadow">ACIDE</div>
          <div className="absolute top-1 left-1/2 transform -translate-x-1/2 text-white text-sm font-bold drop-shadow">NEUTRE</div>
          <div className="absolute top-1 right-2 text-white text-sm font-bold drop-shadow">BASIQUE</div>
        </div>

        {/* Slider */}
        <input
          type="range"
          min={0}
          max={14}
          step={0.1}
          value={selectedPH}
          onChange={(e) => setSelectedPH(parseFloat(e.target.value))}
          className="w-full h-3 bg-gray-700 rounded-lg appearance-none cursor-pointer"
          style={{ accentColor: getPHColor(selectedPH) }}
        />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {/* Visualisation moléculaire */}
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex justify-between items-center mb-3">
            <h4 className="text-sm font-semibold text-cyan-400">Vue moléculaire</h4>
            <div className="flex gap-2">
              <button
                onClick={() => setShowMolecules(!showMolecules)}
                className={`px-2 py-1 rounded text-xs ${showMolecules ? 'bg-cyan-600' : 'bg-gray-600'}`}
              >
                {showMolecules ? 'Masquer' : 'Afficher'}
              </button>
              <button
                onClick={() => setIsAnimating(!isAnimating)}
                className={`px-2 py-1 rounded text-xs ${isAnimating ? 'bg-green-600' : 'bg-gray-600'}`}
                disabled={!showMolecules}
              >
                {isAnimating ? '⏸' : '▶'}
              </button>
            </div>
          </div>

          <svg viewBox="0 0 300 200" className="w-full h-48 bg-gray-900 rounded-lg border border-gray-700">
            {/* Solution colorée */}
            <rect
              x={0}
              y={0}
              width={300}
              height={200}
              fill={getPHColor(selectedPH)}
              opacity={0.15}
            />

            {showMolecules && molecules.map(mol => (
              <g key={mol.id} transform={`translate(${mol.x}, ${mol.y})`}>
                <circle
                  r={mol.type === 'H2O' ? 6 : 8}
                  fill={getMoleculeColor(mol.type)}
                  opacity={mol.type === 'H2O' ? 0.4 : 0.9}
                />
                <text
                  y={mol.type === 'H2O' ? 1 : 1.5}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="white"
                  fontSize={mol.type === 'H2O' ? 5 : 6}
                  fontWeight="bold"
                >
                  {mol.type === 'H3O+' ? 'H⁺' : mol.type === 'OH-' ? 'OH⁻' : ''}
                </text>
              </g>
            ))}

            {/* Légende */}
            <g transform="translate(10, 170)">
              <circle cx={0} cy={0} r={5} fill="#ef4444" />
              <text x={10} y={4} fill="#fff" fontSize="10">H₃O⁺</text>
              <circle cx={60} cy={0} r={5} fill="#3b82f6" />
              <text x={70} y={4} fill="#fff" fontSize="10">OH⁻</text>
              <circle cx={120} cy={0} r={4} fill="#94a3b8" opacity={0.5} />
              <text x={130} y={4} fill="#fff" fontSize="10">H₂O</text>
            </g>
          </svg>

          {/* Concentrations */}
          <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
            <div className="bg-red-900/30 p-2 rounded border border-red-700">
              <p className="text-red-400 font-semibold">[H₃O⁺]</p>
              <p className="text-white font-mono">{hConcentration.toExponential(1)} M</p>
            </div>
            <div className="bg-blue-900/30 p-2 rounded border border-blue-700">
              <p className="text-blue-400 font-semibold">[OH⁻]</p>
              <p className="text-white font-mono">{ohConcentration.toExponential(1)} M</p>
            </div>
          </div>
        </div>

        {/* Information sur la solution */}
        <div className="space-y-4">
          <div className="bg-gray-800 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-purple-400 mb-3">Solution proche</h4>
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-full border-2 border-white/30"
                style={{ backgroundColor: closestSolution.color }}
              />
              <div>
                <p className="text-white font-semibold">{closestSolution.name}</p>
                <p className="text-sm text-gray-400">{closestSolution.formula} - pH ≈ {closestSolution.pH}</p>
                <p className="text-xs text-gray-500">{closestSolution.description}</p>
              </div>
            </div>
          </div>

          {/* Boutons exemples */}
          <div className="bg-gray-800 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-green-400 mb-3">Exemples courants</h4>
            <div className="flex flex-wrap gap-2">
              {solutions.map(sol => (
                <button
                  key={sol.name}
                  onClick={() => setSelectedPH(sol.pH)}
                  className="px-2 py-1 rounded text-xs font-medium transition-all hover:scale-105"
                  style={{
                    backgroundColor: sol.color,
                    color: sol.pH > 5 && sol.pH < 9 ? '#000' : '#fff'
                  }}
                >
                  {sol.name}
                </button>
              ))}
            </div>
          </div>

          {/* Toggle réaction */}
          <button
            onClick={() => setShowReaction(!showReaction)}
            className="w-full bg-gray-800 hover:bg-gray-700 rounded-lg p-3 text-left transition-colors"
          >
            <span className="text-sm text-gray-300">
              {showReaction ? '▼' : '▶'} Transfert de proton
            </span>
          </button>
        </div>
      </div>

      {/* Section transfert de proton */}
      {showReaction && (
        <div className="mt-4 bg-gray-800 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-orange-400 mb-3">Réaction acide-base: Transfert de proton</h4>

          <div className="grid md:grid-cols-2 gap-4">
            {/* Visualisation du transfert */}
            <div className="bg-gray-900 rounded-lg p-4">
              <svg viewBox="0 0 300 120" className="w-full h-32">
                {/* Acide HA */}
                <g transform="translate(50, 60)">
                  <circle r={25} fill="#f97316" opacity={0.3} />
                  <circle r={18} fill="#f97316" />
                  <text y={5} textAnchor="middle" fill="white" fontSize="14" fontWeight="bold">HA</text>
                  <text y={-35} textAnchor="middle" fill="#f97316" fontSize="10">ACIDE</text>
                </g>

                {/* Proton H+ en transfert */}
                <g transform="translate(150, 60)">
                  <circle r={10} fill="#ef4444" stroke="#fff" strokeWidth={2}>
                    <animate
                      attributeName="cx"
                      values="-60;60;60;-60"
                      dur="3s"
                      repeatCount="indefinite"
                    />
                  </circle>
                  <text textAnchor="middle" dominantBaseline="middle" fill="white" fontSize="10" fontWeight="bold">
                    <animate
                      attributeName="x"
                      values="-60;60;60;-60"
                      dur="3s"
                      repeatCount="indefinite"
                    />
                    H⁺
                  </text>
                </g>

                {/* Base B */}
                <g transform="translate(250, 60)">
                  <circle r={25} fill="#3b82f6" opacity={0.3} />
                  <circle r={18} fill="#3b82f6" />
                  <text y={5} textAnchor="middle" fill="white" fontSize="14" fontWeight="bold">B</text>
                  <text y={-35} textAnchor="middle" fill="#3b82f6" fontSize="10">BASE</text>
                </g>

                {/* Flèche */}
                <path
                  d="M 80 60 L 220 60"
                  stroke="#fff"
                  strokeWidth={2}
                  markerEnd="url(#arrow)"
                  opacity={0.5}
                />
                <defs>
                  <marker id="arrow" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
                    <path d="M0,0 L0,6 L9,3 z" fill="#fff" />
                  </marker>
                </defs>
              </svg>

              <div className="text-center mt-2">
                <MathBlock>{String.raw`\text{HA} + \text{B} \rightleftharpoons \text{A}^- + \text{BH}^+`}</MathBlock>
                <p className="text-xs text-gray-400 mt-1">L'acide donne un proton à la base</p>
              </div>
            </div>

            {/* Couples acide-base */}
            <div className="space-y-3">
              <div className="bg-gray-700/50 rounded-lg p-3">
                <p className="text-sm text-gray-300 mb-2">Couples acide/base conjuguée:</p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <MathInline>{String.raw`\text{H}_3\text{O}^+ / \text{H}_2\text{O}`}</MathInline>
                    <span className="text-gray-400">pKa = 0</span>
                  </div>
                  <div className="flex justify-between">
                    <MathInline>{String.raw`\text{CH}_3\text{COOH} / \text{CH}_3\text{COO}^-`}</MathInline>
                    <span className="text-gray-400">pKa = 4.75</span>
                  </div>
                  <div className="flex justify-between">
                    <MathInline>{String.raw`\text{NH}_4^+ / \text{NH}_3`}</MathInline>
                    <span className="text-gray-400">pKa = 9.25</span>
                  </div>
                  <div className="flex justify-between">
                    <MathInline>{String.raw`\text{H}_2\text{O} / \text{OH}^-`}</MathInline>
                    <span className="text-gray-400">pKa = 14</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Formules importantes */}
      <div className="mt-4 grid md:grid-cols-3 gap-4">
        <div className="bg-gray-800 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-red-400 mb-2">Définition du pH</h4>
          <MathBlock>{String.raw`\text{pH} = -\log[\text{H}_3\text{O}^+]`}</MathBlock>
          <p className="text-xs text-gray-400 mt-2">
            Échelle logarithmique de 0 à 14
          </p>
        </div>

        <div className="bg-gray-800 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-green-400 mb-2">Produit ionique de l'eau</h4>
          <MathBlock>{String.raw`K_e = [\text{H}_3\text{O}^+] \cdot [\text{OH}^-] = 10^{-14}`}</MathBlock>
          <p className="text-xs text-gray-400 mt-2">
            À 25°C, Ke est constant
          </p>
        </div>

        <div className="bg-gray-800 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-blue-400 mb-2">Relation pH + pOH</h4>
          <MathBlock>{String.raw`\text{pH} + \text{pOH} = 14`}</MathBlock>
          <p className="text-xs text-gray-400 mt-2">
            pOH = {(14 - selectedPH).toFixed(1)}
          </p>
        </div>
      </div>
    </div>
  )
}
