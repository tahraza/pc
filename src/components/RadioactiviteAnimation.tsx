'use client'

import React, { useState, useEffect, useRef, useMemo } from 'react'
import { MathBlock, MathInline } from './SvgMath'

interface Isotope {
  name: string
  symbol: string
  halfLife: number // en secondes
  halfLifeDisplay: string
  type: 'alpha' | 'beta-' | 'beta+' | 'gamma'
  color: string
}

const isotopes: Isotope[] = [
  { name: 'Carbone-14', symbol: '¹⁴C', halfLife: 5730 * 365.25 * 24 * 3600, halfLifeDisplay: '5730 ans', type: 'beta-', color: '#3b82f6' },
  { name: 'Iode-131', symbol: '¹³¹I', halfLife: 8.02 * 24 * 3600, halfLifeDisplay: '8.02 jours', type: 'beta-', color: '#8b5cf6' },
  { name: 'Cobalt-60', symbol: '⁶⁰Co', halfLife: 5.27 * 365.25 * 24 * 3600, halfLifeDisplay: '5.27 ans', type: 'beta-', color: '#ec4899' },
  { name: 'Uranium-238', symbol: '²³⁸U', halfLife: 4.47e9 * 365.25 * 24 * 3600, halfLifeDisplay: '4.47 Ga', type: 'alpha', color: '#f97316' },
  { name: 'Radon-222', symbol: '²²²Rn', halfLife: 3.82 * 24 * 3600, halfLifeDisplay: '3.82 jours', type: 'alpha', color: '#14b8a6' },
  { name: 'Polonium-210', symbol: '²¹⁰Po', halfLife: 138.4 * 24 * 3600, halfLifeDisplay: '138.4 jours', type: 'alpha', color: '#ef4444' },
]

interface Particle {
  id: number
  x: number
  y: number
  decayed: boolean
  decayTime: number
}

export default function RadioactiviteAnimation() {
  const [selectedIsotope, setSelectedIsotope] = useState(1) // Iode-131 par défaut
  const [initialCount, setInitialCount] = useState(100)
  const [timeScale, setTimeScale] = useState(1) // Nombre de demi-vies à afficher
  const [currentTime, setCurrentTime] = useState(0) // Temps écoulé en fraction de t½
  const [isPlaying, setIsPlaying] = useState(false)
  const [showParticles, setShowParticles] = useState(true)
  const [particles, setParticles] = useState<Particle[]>([])
  const animationRef = useRef<number>()

  const isotope = isotopes[selectedIsotope]

  // Initialiser les particules
  useEffect(() => {
    const newParticles: Particle[] = []
    const gridSize = Math.ceil(Math.sqrt(initialCount))
    const cellSize = 280 / gridSize

    for (let i = 0; i < initialCount; i++) {
      const row = Math.floor(i / gridSize)
      const col = i % gridSize
      newParticles.push({
        id: i,
        x: 10 + col * cellSize + cellSize / 2 + (Math.random() - 0.5) * cellSize * 0.5,
        y: 10 + row * cellSize + cellSize / 2 + (Math.random() - 0.5) * cellSize * 0.5,
        decayed: false,
        decayTime: -Math.log(Math.random()) // Temps de décroissance aléatoire (distribution exponentielle)
      })
    }
    setParticles(newParticles)
    setCurrentTime(0)
    setIsPlaying(false)
  }, [initialCount, selectedIsotope])

  // Animation
  useEffect(() => {
    if (!isPlaying) return

    const animate = () => {
      setCurrentTime(prev => {
        const newTime = prev + 0.01
        if (newTime >= timeScale * 5) {
          setIsPlaying(false)
          return timeScale * 5
        }
        return newTime
      })
      animationRef.current = requestAnimationFrame(animate)
    }

    animationRef.current = requestAnimationFrame(animate)
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current)
    }
  }, [isPlaying, timeScale])

  // Mettre à jour l'état des particules
  useEffect(() => {
    setParticles(prev => prev.map(p => ({
      ...p,
      decayed: currentTime >= p.decayTime
    })))
  }, [currentTime])

  // Calculs
  const lambda = Math.LN2 // Constante de décroissance (normalisée à t½ = 1)
  const N_t = initialCount * Math.exp(-lambda * currentTime)
  const remainingCount = particles.filter(p => !p.decayed).length
  const decayedCount = initialCount - remainingCount
  const activity = lambda * N_t // Activité relative

  // Points pour le graphe
  const curvePoints = useMemo(() => {
    const points: { t: number; N: number }[] = []
    const maxT = timeScale * 5
    for (let t = 0; t <= maxT; t += maxT / 100) {
      points.push({ t, N: initialCount * Math.exp(-lambda * t) })
    }
    return points
  }, [initialCount, timeScale])

  // Dimensions SVG graphe
  const svgWidth = 400
  const svgHeight = 250
  const margin = { top: 20, right: 20, bottom: 40, left: 50 }
  const plotWidth = svgWidth - margin.left - margin.right
  const plotHeight = svgHeight - margin.top - margin.bottom
  const maxT = timeScale * 5

  const xScale = (t: number) => margin.left + (t / maxT) * plotWidth
  const yScale = (N: number) => margin.top + plotHeight - (N / initialCount) * plotHeight

  const curvePath = curvePoints
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${xScale(p.t).toFixed(1)} ${yScale(p.N).toFixed(1)}`)
    .join(' ')

  // Type de rayonnement
  const radiationType = {
    'alpha': { symbol: 'α', description: 'Noyau d\'hélium (²He)', color: '#f97316', formula: String.raw`^4_2\text{He}^{2+}` },
    'beta-': { symbol: 'β⁻', description: 'Électron + antineutrino', color: '#3b82f6', formula: String.raw`e^- + \bar{\nu}_e` },
    'beta+': { symbol: 'β⁺', description: 'Positron + neutrino', color: '#ec4899', formula: String.raw`e^+ + \nu_e` },
    'gamma': { symbol: 'γ', description: 'Photon de haute énergie', color: '#a855f7', formula: String.raw`\gamma` },
  }

  const radiation = radiationType[isotope.type]

  return (
    <div className="p-4 bg-gray-900 rounded-xl">
      <h3 className="text-lg font-semibold text-white mb-4">Décroissance Radioactive</h3>

      {/* Sélection de l'isotope */}
      <div className="flex flex-wrap gap-2 mb-4">
        {isotopes.map((iso, index) => (
          <button
            key={index}
            onClick={() => setSelectedIsotope(index)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              selectedIsotope === index
                ? 'text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
            style={selectedIsotope === index ? { backgroundColor: iso.color } : {}}
          >
            {iso.symbol} {iso.name.split('-')[0]}
          </button>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {/* Visualisation des noyaux */}
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex justify-between items-center mb-3">
            <h4 className="text-sm font-semibold text-cyan-400">Échantillon radioactif</h4>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setCurrentTime(0)
                  setParticles(prev => prev.map(p => ({ ...p, decayed: false })))
                }}
                className="px-2 py-1 bg-gray-600 hover:bg-gray-500 rounded text-xs"
              >
                ↺ Reset
              </button>
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className={`px-3 py-1 rounded text-xs font-medium ${
                  isPlaying ? 'bg-red-600 hover:bg-red-500' : 'bg-green-600 hover:bg-green-500'
                }`}
              >
                {isPlaying ? '⏸ Pause' : '▶ Simuler'}
              </button>
            </div>
          </div>

          {showParticles && (
            <svg viewBox="0 0 300 200" className="w-full h-48 bg-gray-900 rounded-lg border border-gray-700">
              {particles.map(p => (
                <g key={p.id}>
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r={Math.min(8, 140 / Math.sqrt(initialCount))}
                    fill={p.decayed ? '#4b5563' : isotope.color}
                    opacity={p.decayed ? 0.3 : 0.9}
                  >
                    {p.decayed && (
                      <animate
                        attributeName="r"
                        from={Math.min(8, 140 / Math.sqrt(initialCount))}
                        to={Math.min(8, 140 / Math.sqrt(initialCount)) * 0.6}
                        dur="0.3s"
                        fill="freeze"
                      />
                    )}
                  </circle>
                  {/* Rayonnement émis lors de la désintégration */}
                  {p.decayed && Math.abs(currentTime - p.decayTime) < 0.2 && (
                    <circle
                      cx={p.x}
                      cy={p.y}
                      r={5}
                      fill="none"
                      stroke={radiation.color}
                      strokeWidth={2}
                      opacity={0.8}
                    >
                      <animate attributeName="r" from="5" to="25" dur="0.5s" fill="freeze" />
                      <animate attributeName="opacity" from="0.8" to="0" dur="0.5s" fill="freeze" />
                    </circle>
                  )}
                </g>
              ))}

              {/* Légende */}
              <g transform="translate(10, 175)">
                <circle cx={8} cy={0} r={5} fill={isotope.color} />
                <text x={18} y={4} fill="#d1d5db" fontSize="10">Actif: {remainingCount}</text>
                <circle cx={100} cy={0} r={5} fill="#4b5563" opacity={0.5} />
                <text x={110} y={4} fill="#9ca3af" fontSize="10">Désintégré: {decayedCount}</text>
              </g>
            </svg>
          )}

          {/* Compteurs */}
          <div className="mt-3 grid grid-cols-3 gap-2 text-center">
            <div className="bg-gray-700 rounded p-2">
              <p className="text-xs text-gray-400">Temps écoulé</p>
              <p className="text-lg font-bold" style={{ color: isotope.color }}>
                {currentTime.toFixed(2)} t½
              </p>
            </div>
            <div className="bg-gray-700 rounded p-2">
              <p className="text-xs text-gray-400">N(t) théorique</p>
              <p className="text-lg font-bold text-cyan-400">{Math.round(N_t)}</p>
            </div>
            <div className="bg-gray-700 rounded p-2">
              <p className="text-xs text-gray-400">Activité A(t)</p>
              <p className="text-lg font-bold text-purple-400">{(activity / initialCount * 100).toFixed(1)}%</p>
            </div>
          </div>
        </div>

        {/* Graphe de décroissance */}
        <div className="bg-gray-800 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-purple-400 mb-3">Courbe de décroissance</h4>
          <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-auto">
            {/* Grille horizontale */}
            {[0, 0.25, 0.5, 0.75, 1].map(ratio => (
              <g key={ratio}>
                <line
                  x1={margin.left}
                  y1={yScale(ratio * initialCount)}
                  x2={svgWidth - margin.right}
                  y2={yScale(ratio * initialCount)}
                  stroke={ratio === 0.5 ? '#6b7280' : '#374151'}
                  strokeWidth={ratio === 0.5 ? 1 : 0.5}
                  strokeDasharray={ratio === 0.5 ? '4,4' : 'none'}
                />
                <text x={margin.left - 5} y={yScale(ratio * initialCount)} textAnchor="end" dominantBaseline="middle" fill="#9ca3af" fontSize="10">
                  {(ratio * 100).toFixed(0)}%
                </text>
              </g>
            ))}

            {/* Grille verticale (demi-vies) */}
            {[1, 2, 3, 4, 5].map(n => {
              if (n > timeScale * 5) return null
              return (
                <g key={n}>
                  <line
                    x1={xScale(n)}
                    y1={margin.top}
                    x2={xScale(n)}
                    y2={svgHeight - margin.bottom}
                    stroke="#4b5563"
                    strokeWidth={0.5}
                    strokeDasharray="4,4"
                  />
                  <text x={xScale(n)} y={svgHeight - margin.bottom + 15} textAnchor="middle" fill="#9ca3af" fontSize="10">
                    {n}t½
                  </text>
                </g>
              )
            })}

            {/* Axe X label */}
            <text x={svgWidth / 2} y={svgHeight - 5} textAnchor="middle" fill="#d1d5db" fontSize="11">Temps (en demi-vies)</text>
            <text x={10} y={svgHeight / 2} textAnchor="middle" fill="#d1d5db" fontSize="11" transform={`rotate(-90, 10, ${svgHeight / 2})`}>N/N₀</text>

            {/* Courbe de décroissance */}
            <path d={curvePath} fill="none" stroke={isotope.color} strokeWidth={2.5} />

            {/* Zone remplie */}
            <path
              d={`${curvePath} L ${xScale(maxT)} ${yScale(0)} L ${xScale(0)} ${yScale(0)} Z`}
              fill={isotope.color}
              opacity={0.15}
            />

            {/* Point courant */}
            <circle
              cx={xScale(currentTime)}
              cy={yScale(N_t)}
              r={6}
              fill={isotope.color}
              stroke="#fff"
              strokeWidth={2}
            />

            {/* Ligne horizontale à N/2 */}
            <line
              x1={margin.left}
              y1={yScale(initialCount / 2)}
              x2={xScale(1)}
              y2={yScale(initialCount / 2)}
              stroke="#22d3ee"
              strokeWidth={1.5}
              strokeDasharray="4,2"
            />
            <line
              x1={xScale(1)}
              y1={yScale(initialCount / 2)}
              x2={xScale(1)}
              y2={yScale(0)}
              stroke="#22d3ee"
              strokeWidth={1.5}
              strokeDasharray="4,2"
            />
            <text x={xScale(1) + 5} y={yScale(initialCount / 2) - 5} fill="#22d3ee" fontSize="10">N₀/2 à t = t½</text>
          </svg>
        </div>
      </div>

      {/* Contrôles */}
      <div className="mt-4 grid md:grid-cols-3 gap-4">
        <div className="bg-gray-800 rounded-lg p-3">
          <label className="block text-sm text-gray-300 mb-1">
            Nombre initial N₀: <span className="text-cyan-400 font-bold">{initialCount}</span>
          </label>
          <input
            type="range"
            min={20}
            max={200}
            step={10}
            value={initialCount}
            onChange={(e) => setInitialCount(parseInt(e.target.value))}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
          />
        </div>

        <div className="bg-gray-800 rounded-lg p-3">
          <label className="block text-sm text-gray-300 mb-1">
            Échelle temps: <span className="text-purple-400 font-bold">{timeScale * 5} t½</span>
          </label>
          <input
            type="range"
            min={0.5}
            max={2}
            step={0.5}
            value={timeScale}
            onChange={(e) => setTimeScale(parseFloat(e.target.value))}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
          />
        </div>

        <div className="bg-gray-800 rounded-lg p-3">
          <label className="flex items-center gap-2 text-sm text-gray-300">
            <input
              type="checkbox"
              checked={showParticles}
              onChange={(e) => setShowParticles(e.target.checked)}
              className="rounded bg-gray-700 border-gray-600 text-cyan-500"
            />
            Afficher les particules
          </label>
          <p className="text-xs text-gray-500 mt-1">
            t½ = {isotope.halfLifeDisplay}
          </p>
        </div>
      </div>

      {/* Formules et informations */}
      <div className="mt-4 grid md:grid-cols-2 gap-4">
        <div className="bg-gray-800 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-cyan-400 mb-2">Loi de décroissance</h4>
          <MathBlock>{String.raw`N(t) = N_0 \cdot e^{-\lambda t} = N_0 \cdot \left(\frac{1}{2}\right)^{t/t_{1/2}}`}</MathBlock>

          <div className="mt-3 space-y-2 text-sm">
            <p className="text-gray-300">
              <MathInline>{String.raw`\lambda = \frac{\ln 2}{t_{1/2}}`}</MathInline>
              <span className="text-gray-500 ml-2">(constante radioactive)</span>
            </p>
            <p className="text-gray-300">
              <MathInline>{String.raw`A(t) = \lambda \cdot N(t) = A_0 \cdot e^{-\lambda t}`}</MathInline>
              <span className="text-gray-500 ml-2">(activité)</span>
            </p>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-4">
          <h4 className="text-sm font-semibold mb-2" style={{ color: radiation.color }}>
            Rayonnement {radiation.symbol} ({isotope.type})
          </h4>

          <div className="flex items-center gap-3 mb-3">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold"
              style={{ backgroundColor: radiation.color + '33', border: `2px solid ${radiation.color}` }}
            >
              {radiation.symbol}
            </div>
            <div>
              <p className="text-gray-300">{radiation.description}</p>
              <MathInline>{radiation.formula}</MathInline>
            </div>
          </div>

          <div className="text-sm text-gray-400">
            {isotope.type === 'alpha' && (
              <p>Particule lourde, très ionisante, faible pénétration (arrêtée par une feuille de papier)</p>
            )}
            {isotope.type === 'beta-' && (
              <p>Électron émis, pénétration moyenne (arrêtée par quelques mm d'aluminium)</p>
            )}
            {isotope.type === 'gamma' && (
              <p>Rayonnement électromagnétique, très pénétrant (atténué par le plomb)</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
