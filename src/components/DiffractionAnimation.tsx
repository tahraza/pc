'use client'

import React, { useState, useMemo } from 'react'
import { MathBlock, MathInline } from './SvgMath'

type DiffractionMode = 'single' | 'double'

export default function DiffractionAnimation() {
  const [mode, setMode] = useState<DiffractionMode>('single')
  const [slitWidth, setSlitWidth] = useState(50) // largeur fente en µm
  const [slitSpacing, setSlitSpacing] = useState(200) // espacement fentes en µm
  const [wavelength, setWavelength] = useState(550) // longueur d'onde en nm
  const [screenDistance, setScreenDistance] = useState(1) // distance écran en m
  const [showEnvelope, setShowEnvelope] = useState(true)

  // Conversion longueur d'onde en couleur
  const wavelengthToColor = (wl: number): string => {
    if (wl < 380) return '#7c00ff'
    if (wl < 440) return `rgb(${Math.round(138 - (wl - 380) * 2.3)}, 0, 255)`
    if (wl < 490) return `rgb(0, ${Math.round((wl - 440) * 5.1)}, 255)`
    if (wl < 510) return `rgb(0, 255, ${Math.round(255 - (wl - 490) * 12.75)})`
    if (wl < 580) return `rgb(${Math.round((wl - 510) * 3.64)}, 255, 0)`
    if (wl < 645) return `rgb(255, ${Math.round(255 - (wl - 580) * 3.92)}, 0)`
    return '#ff0000'
  }

  const lightColor = wavelengthToColor(wavelength)

  // Calcul du pattern de diffraction
  const diffractionPattern = useMemo(() => {
    const points: { x: number; intensity: number }[] = []
    const lambda = wavelength * 1e-9 // en mètres
    const a = slitWidth * 1e-6 // largeur fente en mètres
    const d = slitSpacing * 1e-6 // espacement en mètres
    const D = screenDistance // distance écran

    // Position sur l'écran de -15mm à +15mm
    for (let xMm = -15; xMm <= 15; xMm += 0.1) {
      const x = xMm * 1e-3 // en mètres
      const theta = Math.atan(x / D)
      const sinTheta = Math.sin(theta)

      // Facteur de diffraction par une fente (sinc²)
      const alpha = (Math.PI * a * sinTheta) / lambda
      const singleSlitFactor = alpha === 0 ? 1 : Math.pow(Math.sin(alpha) / alpha, 2)

      let intensity: number
      if (mode === 'single') {
        intensity = singleSlitFactor
      } else {
        // Facteur d'interférence pour double fente
        const beta = (Math.PI * d * sinTheta) / lambda
        const doubleSlitFactor = Math.pow(Math.cos(beta), 2)
        intensity = singleSlitFactor * doubleSlitFactor
      }

      points.push({ x: xMm, intensity })
    }

    return points
  }, [mode, slitWidth, slitSpacing, wavelength, screenDistance])

  // Enveloppe de diffraction (pour double fente)
  const envelopePattern = useMemo(() => {
    if (mode === 'single') return []

    const points: { x: number; intensity: number }[] = []
    const lambda = wavelength * 1e-9
    const a = slitWidth * 1e-6
    const D = screenDistance

    for (let xMm = -15; xMm <= 15; xMm += 0.1) {
      const x = xMm * 1e-3
      const theta = Math.atan(x / D)
      const sinTheta = Math.sin(theta)
      const alpha = (Math.PI * a * sinTheta) / lambda
      const intensity = alpha === 0 ? 1 : Math.pow(Math.sin(alpha) / alpha, 2)
      points.push({ x: xMm, intensity })
    }

    return points
  }, [mode, slitWidth, wavelength, screenDistance])

  // Dimensions SVG
  const svgWidth = 500
  const svgHeight = 300
  const margin = { top: 30, right: 20, bottom: 40, left: 50 }
  const plotWidth = svgWidth - margin.left - margin.right
  const plotHeight = svgHeight - margin.top - margin.bottom

  const xScale = (x: number) => margin.left + ((x + 15) / 30) * plotWidth
  const yScale = (i: number) => margin.top + plotHeight - i * plotHeight

  // Chemin du pattern
  const patternPath = diffractionPattern
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${xScale(p.x).toFixed(1)} ${yScale(p.intensity).toFixed(1)}`)
    .join(' ')

  const envelopePath = envelopePattern
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${xScale(p.x).toFixed(1)} ${yScale(p.intensity).toFixed(1)}`)
    .join(' ')

  // Calculs théoriques
  const lambda = wavelength * 1e-9
  const a = slitWidth * 1e-6
  const d = slitSpacing * 1e-6
  const D = screenDistance

  // Position du premier minimum de diffraction
  const firstMinDiff = (lambda * D / a) * 1000 // en mm

  // Interfrange (double fente)
  const interfrange = (lambda * D / d) * 1000 // en mm

  return (
    <div className="p-4 bg-gray-900 rounded-xl">
      <h3 className="text-lg font-semibold text-white mb-4">Diffraction et Interférences</h3>

      {/* Sélection du mode */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setMode('single')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            mode === 'single' ? 'bg-purple-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          Fente simple
        </button>
        <button
          onClick={() => setMode('double')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            mode === 'double' ? 'bg-purple-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          Fentes d'Young
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {/* Visualisation du montage */}
        <div className="bg-gray-800 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-cyan-400 mb-3">Montage optique</h4>
          <svg viewBox="0 0 300 200" className="w-full h-40">
            {/* Source laser */}
            <rect x={10} y={85} width={30} height={30} fill="#333" stroke="#666" strokeWidth={1} rx={3} />
            <text x={25} y={130} textAnchor="middle" fill="#9ca3af" fontSize="10">Laser</text>

            {/* Faisceau incident */}
            <line x1={40} y1={100} x2={100} y2={100} stroke={lightColor} strokeWidth={3} opacity={0.8} />

            {/* Fente(s) */}
            <rect x={98} y={60} width={4} height={80} fill="#1e293b" stroke="#475569" strokeWidth={1} />
            {mode === 'single' ? (
              <rect x={98} y={95} width={4} height={10} fill={lightColor} opacity={0.8} />
            ) : (
              <>
                <rect x={98} y={85} width={4} height={6} fill={lightColor} opacity={0.8} />
                <rect x={98} y={109} width={4} height={6} fill={lightColor} opacity={0.8} />
              </>
            )}
            <text x={100} y={155} textAnchor="middle" fill="#9ca3af" fontSize="10">
              {mode === 'single' ? 'Fente' : 'Fentes'}
            </text>

            {/* Rayons diffractés */}
            {[-30, -15, 0, 15, 30].map((angle, i) => (
              <line
                key={i}
                x1={102}
                y1={100}
                x2={250}
                y2={100 + angle * 2}
                stroke={lightColor}
                strokeWidth={1}
                opacity={0.3 + 0.7 * Math.pow(Math.cos(angle * Math.PI / 60), 2)}
              />
            ))}

            {/* Écran */}
            <rect x={248} y={40} width={6} height={120} fill="#1e293b" stroke="#475569" strokeWidth={1} />
            <text x={251} y={175} textAnchor="middle" fill="#9ca3af" fontSize="10">Écran</text>

            {/* Pattern sur l'écran */}
            {diffractionPattern.filter((_, i) => i % 3 === 0).map((p, i) => (
              <rect
                key={i}
                x={250}
                y={100 - p.x * 4}
                width={4}
                height={2}
                fill={lightColor}
                opacity={p.intensity * 0.9}
              />
            ))}

            {/* Annotations */}
            <text x={175} y={25} textAnchor="middle" fill="#d1d5db" fontSize="11">D = {screenDistance} m</text>
            <line x1={102} y1={30} x2={248} y2={30} stroke="#6b7280" strokeWidth={1} strokeDasharray="4,2" />
          </svg>
        </div>

        {/* Graphe d'intensité */}
        <div className="bg-gray-800 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-purple-400 mb-3">Figure de diffraction</h4>
          <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-auto">
            {/* Grille */}
            {[0, 0.25, 0.5, 0.75, 1].map(i => (
              <g key={i}>
                <line
                  x1={margin.left}
                  y1={yScale(i)}
                  x2={svgWidth - margin.right}
                  y2={yScale(i)}
                  stroke="#374151"
                  strokeWidth={0.5}
                />
                <text x={margin.left - 5} y={yScale(i)} textAnchor="end" dominantBaseline="middle" fill="#9ca3af" fontSize="10">
                  {i.toFixed(2)}
                </text>
              </g>
            ))}

            {/* Axe X */}
            {[-15, -10, -5, 0, 5, 10, 15].map(x => (
              <g key={x}>
                <line x1={xScale(x)} y1={margin.top} x2={xScale(x)} y2={svgHeight - margin.bottom} stroke="#374151" strokeWidth={0.5} />
                <text x={xScale(x)} y={svgHeight - margin.bottom + 15} textAnchor="middle" fill="#9ca3af" fontSize="10">{x}</text>
              </g>
            ))}

            {/* Labels */}
            <text x={svgWidth / 2} y={svgHeight - 5} textAnchor="middle" fill="#d1d5db" fontSize="12">Position x (mm)</text>
            <text x={15} y={svgHeight / 2} textAnchor="middle" fill="#d1d5db" fontSize="12" transform={`rotate(-90, 15, ${svgHeight / 2})`}>Intensité I/I₀</text>

            {/* Enveloppe (pour double fente) */}
            {mode === 'double' && showEnvelope && (
              <path d={envelopePath} fill="none" stroke="#f97316" strokeWidth={1.5} strokeDasharray="6,3" opacity={0.7} />
            )}

            {/* Courbe principale */}
            <path d={patternPath} fill="none" stroke={lightColor} strokeWidth={2} />

            {/* Zone remplie */}
            <path
              d={`${patternPath} L ${xScale(15)} ${yScale(0)} L ${xScale(-15)} ${yScale(0)} Z`}
              fill={lightColor}
              opacity={0.2}
            />

            {/* Légende */}
            {mode === 'double' && (
              <g transform={`translate(${svgWidth - margin.right - 100}, ${margin.top + 5})`}>
                <rect x={0} y={0} width={95} height={40} fill="rgba(0,0,0,0.5)" rx={4} />
                <line x1={5} y1={12} x2={25} y2={12} stroke={lightColor} strokeWidth={2} />
                <text x={30} y={16} fill="#d1d5db" fontSize="9">Interférences</text>
                <line x1={5} y1={28} x2={25} y2={28} stroke="#f97316" strokeWidth={1.5} strokeDasharray="4,2" />
                <text x={30} y={32} fill="#d1d5db" fontSize="9">Enveloppe</text>
              </g>
            )}
          </svg>
        </div>
      </div>

      {/* Contrôles */}
      <div className="mt-4 grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gray-800 rounded-lg p-3">
          <label className="block text-sm text-gray-300 mb-1">
            Longueur d'onde λ: <span style={{ color: lightColor }} className="font-bold">{wavelength} nm</span>
          </label>
          <input
            type="range"
            min={380}
            max={700}
            value={wavelength}
            onChange={(e) => setWavelength(parseInt(e.target.value))}
            className="w-full h-2 rounded-lg appearance-none cursor-pointer"
            style={{ background: 'linear-gradient(to right, violet, blue, cyan, green, yellow, orange, red)' }}
          />
        </div>

        <div className="bg-gray-800 rounded-lg p-3">
          <label className="block text-sm text-gray-300 mb-1">
            Largeur fente a: <span className="text-cyan-400 font-bold">{slitWidth} µm</span>
          </label>
          <input
            type="range"
            min={10}
            max={200}
            value={slitWidth}
            onChange={(e) => setSlitWidth(parseInt(e.target.value))}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
          />
        </div>

        {mode === 'double' && (
          <div className="bg-gray-800 rounded-lg p-3">
            <label className="block text-sm text-gray-300 mb-1">
              Espacement d: <span className="text-orange-400 font-bold">{slitSpacing} µm</span>
            </label>
            <input
              type="range"
              min={50}
              max={500}
              value={slitSpacing}
              onChange={(e) => setSlitSpacing(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-orange-500"
            />
          </div>
        )}

        <div className="bg-gray-800 rounded-lg p-3">
          <label className="block text-sm text-gray-300 mb-1">
            Distance écran D: <span className="text-purple-400 font-bold">{screenDistance.toFixed(1)} m</span>
          </label>
          <input
            type="range"
            min={0.5}
            max={3}
            step={0.1}
            value={screenDistance}
            onChange={(e) => setScreenDistance(parseFloat(e.target.value))}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
          />
        </div>
      </div>

      {/* Options */}
      {mode === 'double' && (
        <div className="mt-3">
          <label className="flex items-center gap-2 text-sm text-gray-300">
            <input
              type="checkbox"
              checked={showEnvelope}
              onChange={(e) => setShowEnvelope(e.target.checked)}
              className="rounded bg-gray-700 border-gray-600 text-orange-500 focus:ring-orange-500"
            />
            Afficher l'enveloppe de diffraction
          </label>
        </div>
      )}

      {/* Formules et résultats */}
      <div className="mt-4 grid md:grid-cols-2 gap-4">
        <div className="bg-gray-800 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-cyan-400 mb-2">
            {mode === 'single' ? 'Diffraction par une fente' : 'Fentes d\'Young'}
          </h4>

          {mode === 'single' ? (
            <>
              <MathBlock>{String.raw`I(\theta) = I_0 \left( \frac{\sin \alpha}{\alpha} \right)^2`}</MathBlock>
              <p className="text-sm text-gray-400 mt-2">
                avec <MathInline>{String.raw`\alpha = \frac{\pi a \sin\theta}{\lambda}`}</MathInline>
              </p>
              <div className="mt-3 p-2 bg-cyan-900/30 rounded border border-cyan-700">
                <p className="text-sm text-cyan-300">
                  <strong>1er minimum:</strong> x₁ = ±{firstMinDiff.toFixed(2)} mm
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  <MathInline>{String.raw`\theta_1 = \frac{\lambda}{a}`}</MathInline> (petits angles)
                </p>
              </div>
            </>
          ) : (
            <>
              <MathBlock>{String.raw`I(\theta) = I_0 \left( \frac{\sin \alpha}{\alpha} \right)^2 \cos^2 \beta`}</MathBlock>
              <p className="text-sm text-gray-400 mt-2">
                avec <MathInline>{String.raw`\beta = \frac{\pi d \sin\theta}{\lambda}`}</MathInline>
              </p>
              <div className="mt-3 p-2 bg-orange-900/30 rounded border border-orange-700">
                <p className="text-sm text-orange-300">
                  <strong>Interfrange:</strong> i = {interfrange.toFixed(2)} mm
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  <MathInline>{String.raw`i = \frac{\lambda D}{d}`}</MathInline>
                </p>
              </div>
            </>
          )}
        </div>

        <div className="bg-gray-800 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-purple-400 mb-2">Observations</h4>
          <ul className="text-sm text-gray-300 space-y-2">
            {mode === 'single' ? (
              <>
                <li className="flex items-start gap-2">
                  <span className="text-cyan-400">•</span>
                  <span>La tache centrale est <strong>2× plus large</strong> que les taches secondaires</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-cyan-400">•</span>
                  <span>Plus la fente est étroite, plus la figure est <strong>étalée</strong></span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-cyan-400">•</span>
                  <span>Les minima sont à <MathInline>{String.raw`\theta_n = n\frac{\lambda}{a}`}</MathInline></span>
                </li>
              </>
            ) : (
              <>
                <li className="flex items-start gap-2">
                  <span className="text-orange-400">•</span>
                  <span>Les franges d'interférence sont <strong>modulées</strong> par l'enveloppe de diffraction</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-400">•</span>
                  <span>L'interfrange dépend de l'<strong>espacement d</strong> entre les fentes</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-400">•</span>
                  <span>Franges brillantes quand <MathInline>{String.raw`d \sin\theta = n\lambda`}</MathInline></span>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </div>
  )
}
