'use client'

import { useState, useMemo, useCallback } from 'react'

interface SliderProps {
  label: string
  value: number
  min: number
  max: number
  step: number
  unit: string
  onChange: (value: number) => void
  formatValue?: (value: number) => string
}

function Slider({ label, value, min, max, step, unit, onChange, formatValue }: SliderProps) {
  const displayValue = formatValue ? formatValue(value) : value.toFixed(step < 1 ? 2 : 0)

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className="text-slate-400">{label}</span>
        <span className="font-mono text-slate-200">{displayValue} {unit}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer
                   [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4
                   [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full
                   [&::-webkit-slider-thumb]:bg-blue-500 [&::-webkit-slider-thumb]:cursor-pointer
                   [&::-webkit-slider-thumb]:hover:bg-blue-400"
      />
    </div>
  )
}

export function InterferencesAnimation() {
  // Paramètres physiques
  const [lambda, setLambda] = useState(633) // nm (laser rouge)
  const [a, setA] = useState(200) // µm (écartement fentes)
  const [D, setD] = useState(2.0) // m (distance fentes-écran)
  const [selectedX, setSelectedX] = useState(0) // mm (position sur l'écran)
  const [showWaves, setShowWaves] = useState(true)
  const [animating, setAnimating] = useState(false)
  const [time, setTime] = useState(0)

  // Animation
  const toggleAnimation = useCallback(() => {
    setAnimating(prev => !prev)
  }, [])

  // Calculs physiques
  const calculations = useMemo(() => {
    // Interfrange i = λD/a (en mm)
    const lambdaM = lambda * 1e-9 // m
    const aM = a * 1e-6 // m
    const i = (lambdaM * D / aM) * 1000 // mm

    // Différence de marche pour le point sélectionné
    const xM = selectedX * 1e-3 // m
    const delta = (aM * xM / D) * 1e9 // nm pour l'affichage

    // Ratio δ/λ pour déterminer le type d'interférence
    const ratio = Math.abs(delta) / lambda
    const kEntier = Math.round(ratio)
    const ecartDemiEntier = Math.abs(ratio - (kEntier + 0.5))
    const ecartEntier = Math.abs(ratio - kEntier)

    let interferenceType: 'constructive' | 'destructive' | 'intermediaire'
    if (ecartEntier < 0.1) {
      interferenceType = 'constructive'
    } else if (ecartDemiEntier < 0.1) {
      interferenceType = 'destructive'
    } else {
      interferenceType = 'intermediaire'
    }

    return { i, delta, ratio, interferenceType, kEntier }
  }, [lambda, a, D, selectedX])

  // Couleur basée sur la longueur d'onde
  const wavelengthColor = useMemo(() => {
    // Conversion approximative λ → couleur RGB
    if (lambda < 380) return '#7F00FF'
    if (lambda < 440) return `rgb(${Math.round((440-lambda)/(440-380)*255)}, 0, 255)`
    if (lambda < 490) return `rgb(0, ${Math.round((lambda-440)/(490-440)*255)}, 255)`
    if (lambda < 510) return `rgb(0, 255, ${Math.round((510-lambda)/(510-490)*255)})`
    if (lambda < 580) return `rgb(${Math.round((lambda-510)/(580-510)*255)}, 255, 0)`
    if (lambda < 645) return `rgb(255, ${Math.round((645-lambda)/(645-580)*255)}, 0)`
    return '#FF0000'
  }, [lambda])

  // Génération du pattern d'interférence sur l'écran
  const interferencePattern = useMemo(() => {
    const points: { x: number; intensity: number }[] = []
    const lambdaM = lambda * 1e-9
    const aM = a * 1e-6
    const iMm = (lambdaM * D / aM) * 1000 // interfrange en mm

    // Générer des points sur ±30mm de l'écran
    for (let xMm = -30; xMm <= 30; xMm += 0.2) {
      const xM = xMm * 1e-3
      const delta = aM * xM / D
      const phi = (2 * Math.PI * delta) / lambdaM
      // Intensité = cos²(φ/2) = (1 + cos(φ))/2
      const intensity = Math.pow(Math.cos(phi / 2), 2)
      points.push({ x: xMm, intensity })
    }
    return { points, iMm }
  }, [lambda, a, D])

  // Dimensions SVG (agrandies pour meilleure visibilité)
  const svgWidth = 1000
  const svgHeight = 620
  const margin = { top: 40, right: 40, bottom: 50, left: 50 }

  // Échelles pour le dispositif expérimental
  const deviceWidth = svgWidth - margin.left - margin.right
  const deviceHeight = svgHeight - margin.top - margin.bottom

  // Positions dans le SVG
  const sourceX = margin.left + 50
  const slitsX = margin.left + 200
  const screenX = margin.left + deviceWidth - 50
  const centerY = margin.top + deviceHeight / 2

  // Échelle pour l'écran (30mm → pixels)
  const screenScale = (deviceHeight - 40) / 60 // pixels per mm

  return (
    <div className="my-8 rounded-xl overflow-hidden" style={{ background: 'linear-gradient(180deg, #0e1117 0%, #161b22 100%)' }}>
      {/* Header */}
      <div className="px-4 py-3 border-b border-slate-700/50">
        <h3 className="text-lg font-semibold text-slate-100">
          Fentes d'Young — Interférences lumineuses
        </h3>
        <p className="text-sm text-slate-400 mt-1">
          Visualisation interactive de l'expérience des fentes d'Young
        </p>
      </div>

      <div className="flex flex-col">
        {/* SVG Visualization - prend toute la largeur */}
        <div className="p-4 pb-2">
          <svg
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            className="w-full h-auto min-h-[400px]"
            style={{ background: 'transparent' }}
          >
            <defs>
              {/* Gradient pour les ondes */}
              <radialGradient id="waveGradient" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor={wavelengthColor} stopOpacity="0.6" />
                <stop offset="100%" stopColor={wavelengthColor} stopOpacity="0" />
              </radialGradient>

              {/* Gradient pour le faisceau laser */}
              <linearGradient id="laserGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor={wavelengthColor} stopOpacity="0.8" />
                <stop offset="100%" stopColor={wavelengthColor} stopOpacity="0.3" />
              </linearGradient>
            </defs>

            {/* Background grid */}
            <g opacity="0.1">
              {Array.from({ length: 20 }).map((_, i) => (
                <line
                  key={`v${i}`}
                  x1={margin.left + (i * deviceWidth) / 19}
                  y1={margin.top}
                  x2={margin.left + (i * deviceWidth) / 19}
                  y2={margin.top + deviceHeight}
                  stroke="white"
                  strokeWidth="1"
                />
              ))}
              {Array.from({ length: 12 }).map((_, i) => (
                <line
                  key={`h${i}`}
                  x1={margin.left}
                  y1={margin.top + (i * deviceHeight) / 11}
                  x2={margin.left + deviceWidth}
                  y2={margin.top + (i * deviceHeight) / 11}
                  stroke="white"
                  strokeWidth="1"
                />
              ))}
            </g>

            {/* Labels des éléments */}
            <text x={sourceX} y={margin.top + 20} fill="#94a3b8" fontSize="12" textAnchor="middle">
              Source laser
            </text>
            <text x={slitsX} y={margin.top + 20} fill="#94a3b8" fontSize="12" textAnchor="middle">
              Fentes S₁ et S₂
            </text>
            <text x={screenX} y={margin.top + 20} fill="#94a3b8" fontSize="12" textAnchor="middle">
              Écran
            </text>

            {/* Source laser */}
            <rect
              x={sourceX - 20}
              y={centerY - 15}
              width={40}
              height={30}
              rx={4}
              fill="#1e293b"
              stroke="#475569"
              strokeWidth="2"
            />
            <circle cx={sourceX + 15} cy={centerY} r={4} fill={wavelengthColor} />
            <text x={sourceX} y={centerY + 4} fill="#e2e8f0" fontSize="10" textAnchor="middle">
              λ={lambda}nm
            </text>

            {/* Faisceau laser vers les fentes */}
            <line
              x1={sourceX + 20}
              y1={centerY}
              x2={slitsX - 10}
              y2={centerY}
              stroke={wavelengthColor}
              strokeWidth="3"
              opacity="0.6"
            />

            {/* Panneau avec fentes */}
            <rect
              x={slitsX - 8}
              y={margin.top + 40}
              width={16}
              height={deviceHeight - 80}
              fill="#1e293b"
              stroke="#475569"
              strokeWidth="1"
            />

            {/* Fentes S1 et S2 */}
            {(() => {
              const slitSeparationPx = Math.min(80, Math.max(20, a / 5)) // Visualisation de a
              const s1Y = centerY - slitSeparationPx / 2
              const s2Y = centerY + slitSeparationPx / 2
              const slitHeight = 8

              return (
                <>
                  {/* Fente S1 */}
                  <rect
                    x={slitsX - 8}
                    y={s1Y - slitHeight / 2}
                    width={16}
                    height={slitHeight}
                    fill="#0e1117"
                  />
                  <text x={slitsX - 20} y={s1Y + 4} fill="#60a5fa" fontSize="11" textAnchor="end">
                    S₁
                  </text>

                  {/* Fente S2 */}
                  <rect
                    x={slitsX - 8}
                    y={s2Y - slitHeight / 2}
                    width={16}
                    height={slitHeight}
                    fill="#0e1117"
                  />
                  <text x={slitsX - 20} y={s2Y + 4} fill="#60a5fa" fontSize="11" textAnchor="end">
                    S₂
                  </text>

                  {/* Indication de l'écartement a */}
                  <line x1={slitsX + 25} y1={s1Y} x2={slitsX + 25} y2={s2Y} stroke="#fbbf24" strokeWidth="1" />
                  <line x1={slitsX + 22} y1={s1Y} x2={slitsX + 28} y2={s1Y} stroke="#fbbf24" strokeWidth="1" />
                  <line x1={slitsX + 22} y1={s2Y} x2={slitsX + 28} y2={s2Y} stroke="#fbbf24" strokeWidth="1" />
                  <text x={slitsX + 35} y={centerY + 4} fill="#fbbf24" fontSize="10">
                    a={a}µm
                  </text>

                  {/* Ondes circulaires depuis les fentes */}
                  {showWaves && Array.from({ length: 8 }).map((_, i) => {
                    const radius = 30 + i * 40
                    const opacity = 0.3 - i * 0.03
                    return (
                      <g key={i}>
                        <circle
                          cx={slitsX + 8}
                          cy={s1Y}
                          r={radius}
                          fill="none"
                          stroke={wavelengthColor}
                          strokeWidth="1.5"
                          opacity={Math.max(0, opacity)}
                          strokeDasharray="4 4"
                        />
                        <circle
                          cx={slitsX + 8}
                          cy={s2Y}
                          r={radius}
                          fill="none"
                          stroke={wavelengthColor}
                          strokeWidth="1.5"
                          opacity={Math.max(0, opacity)}
                          strokeDasharray="4 4"
                        />
                      </g>
                    )
                  })}

                  {/* Lignes vers le point M sélectionné */}
                  {(() => {
                    const mY = centerY - selectedX * screenScale
                    return (
                      <>
                        <line
                          x1={slitsX + 8}
                          y1={s1Y}
                          x2={screenX - 15}
                          y2={mY}
                          stroke="#60a5fa"
                          strokeWidth="1.5"
                          strokeDasharray="6 3"
                          opacity="0.7"
                        />
                        <line
                          x1={slitsX + 8}
                          y1={s2Y}
                          x2={screenX - 15}
                          y2={mY}
                          stroke="#f472b6"
                          strokeWidth="1.5"
                          strokeDasharray="6 3"
                          opacity="0.7"
                        />
                        {/* Point M sur l'écran */}
                        <circle
                          cx={screenX - 15}
                          cy={mY}
                          r={6}
                          fill="#22c55e"
                          stroke="white"
                          strokeWidth="2"
                        />
                        <text x={screenX + 5} y={mY + 4} fill="#22c55e" fontSize="11" fontWeight="bold">
                          M
                        </text>
                      </>
                    )
                  })()}
                </>
              )
            })()}

            {/* Écran avec pattern d'interférence */}
            <rect
              x={screenX - 15}
              y={margin.top + 40}
              width={20}
              height={deviceHeight - 80}
              fill="#0a0a0a"
              stroke="#475569"
              strokeWidth="1"
            />

            {/* Pattern d'interférence */}
            {interferencePattern.points.map((point, i) => {
              const y = centerY - point.x * screenScale
              if (y < margin.top + 45 || y > margin.top + deviceHeight - 45) return null
              return (
                <rect
                  key={i}
                  x={screenX - 14}
                  y={y - 1}
                  width={18}
                  height={2}
                  fill={wavelengthColor}
                  opacity={point.intensity * 0.9}
                />
              )
            })}

            {/* Échelle de position sur l'écran */}
            {[-20, -10, 0, 10, 20].map(xMm => {
              const y = centerY - xMm * screenScale
              return (
                <g key={xMm}>
                  <line
                    x1={screenX + 8}
                    y1={y}
                    x2={screenX + 15}
                    y2={y}
                    stroke="#64748b"
                    strokeWidth="1"
                  />
                  <text x={screenX + 20} y={y + 4} fill="#64748b" fontSize="9">
                    {xMm === 0 ? '0' : `${xMm > 0 ? '+' : ''}${xMm}mm`}
                  </text>
                </g>
              )
            })}

            {/* Indication de la distance D */}
            <line
              x1={slitsX + 8}
              y1={margin.top + deviceHeight - 20}
              x2={screenX - 15}
              y2={margin.top + deviceHeight - 20}
              stroke="#a78bfa"
              strokeWidth="1"
              markerEnd="url(#arrowEnd)"
              markerStart="url(#arrowStart)"
            />
            <text
              x={(slitsX + screenX) / 2}
              y={margin.top + deviceHeight - 8}
              fill="#a78bfa"
              fontSize="11"
              textAnchor="middle"
            >
              D = {D.toFixed(1)} m
            </text>

            {/* Légende */}
            <g transform={`translate(${margin.left + 10}, ${margin.top + deviceHeight - 60})`}>
              <rect x={0} y={0} width={180} height={55} rx={6} fill="rgba(0,0,0,0.5)" />
              <circle cx={15} cy={15} r={5} fill="#60a5fa" />
              <text x={25} y={19} fill="#94a3b8" fontSize="10">Trajet depuis S₁</text>
              <circle cx={15} cy={35} r={5} fill="#f472b6" />
              <text x={25} y={39} fill="#94a3b8" fontSize="10">Trajet depuis S₂</text>
            </g>

            {/* Formules et résultats */}
            <g transform={`translate(${svgWidth - 280}, ${margin.top + 40})`}>
              <rect x={0} y={0} width={240} height={130} rx={8} fill="rgba(0,0,0,0.6)" stroke="rgba(255,255,255,0.1)" />
              <text x={15} y={25} fill="#e2e8f0" fontSize="13" fontWeight="600">
                Résultats
              </text>
              <text x={15} y={48} fill="#94a3b8" fontSize="11">
                Interfrange : i = λD/a
              </text>
              <text x={15} y={65} fill="#22c55e" fontSize="13" fontFamily="monospace">
                i = {calculations.i.toFixed(2)} mm
              </text>
              <text x={15} y={88} fill="#94a3b8" fontSize="11">
                Diff. de marche au point M :
              </text>
              <text x={15} y={105} fill="#fbbf24" fontSize="13" fontFamily="monospace">
                δ = {Math.abs(calculations.delta).toFixed(1)} nm = {calculations.ratio.toFixed(2)}λ
              </text>
              <text
                x={15}
                y={122}
                fill={calculations.interferenceType === 'constructive' ? '#22c55e' :
                      calculations.interferenceType === 'destructive' ? '#ef4444' : '#fbbf24'}
                fontSize="11"
                fontWeight="500"
              >
                → Interférence {calculations.interferenceType === 'constructive' ? 'CONSTRUCTIVE (brillant)' :
                                calculations.interferenceType === 'destructive' ? 'DESTRUCTIVE (sombre)' :
                                'intermédiaire'}
              </text>
            </g>
          </svg>
        </div>

        {/* Controls Panel - horizontal layout below visualization */}
        <div className="p-4 pt-2 border-t border-slate-700/50 bg-slate-900/50">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Paramètres principaux */}
            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Paramètres optiques</h4>
              <Slider
                label="λ (longueur d'onde)"
                value={lambda}
                min={380}
                max={700}
                step={1}
                unit="nm"
                onChange={setLambda}
              />
              <Slider
                label="a (écartement fentes)"
                value={a}
                min={50}
                max={500}
                step={10}
                unit="µm"
                onChange={setA}
              />
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Géométrie</h4>
              <Slider
                label="D (distance fentes-écran)"
                value={D}
                min={0.5}
                max={5}
                step={0.1}
                unit="m"
                onChange={setD}
              />
              <Slider
                label="Position x du point M"
                value={selectedX}
                min={-25}
                max={25}
                step={0.5}
                unit="mm"
                onChange={setSelectedX}
              />
            </div>

            {/* Formules clés */}
            <div className="p-3 rounded-lg bg-slate-800/80 border border-slate-700">
              <h5 className="text-xs font-semibold text-slate-400 mb-2">FORMULES CLÉS</h5>
              <div className="space-y-1 text-xs font-mono text-slate-300">
                <div>δ = a·x / D</div>
                <div>i = λ·D / a</div>
                <div className="text-green-400">Constructif : δ = k·λ</div>
                <div className="text-red-400">Destructif : δ = (k+½)·λ</div>
              </div>
            </div>

            {/* Interprétation + Options */}
            <div className="space-y-3">
              <div className="p-3 rounded-lg bg-blue-900/30 border border-blue-800/50">
                <h5 className="text-xs font-semibold text-blue-300 mb-1">INTERPRÉTATION</h5>
                <ul className="text-xs text-blue-200/80 space-y-0.5">
                  <li>• ↑ D → franges s'écartent</li>
                  <li>• ↑ a → franges se resserrent</li>
                  <li>• ↑ λ (rouge) → i augmente</li>
                </ul>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="showWaves"
                  checked={showWaves}
                  onChange={(e) => setShowWaves(e.target.checked)}
                  className="rounded border-slate-600 bg-slate-800 text-blue-500"
                />
                <label htmlFor="showWaves" className="text-sm text-slate-300">
                  Afficher les ondes
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer with color indicator */}
      <div className="px-4 py-3 border-t border-slate-700/50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className="w-6 h-6 rounded-full border-2 border-white/20"
            style={{ backgroundColor: wavelengthColor }}
          />
          <span className="text-sm text-slate-400">
            Couleur : λ = {lambda} nm
            {lambda < 450 ? ' (violet/bleu)' :
             lambda < 495 ? ' (bleu/cyan)' :
             lambda < 570 ? ' (vert)' :
             lambda < 590 ? ' (jaune)' :
             lambda < 620 ? ' (orange)' : ' (rouge)'}
          </span>
        </div>
        <div className="text-xs text-slate-500">
          Interfrange actuel : <span className="text-green-400 font-mono">{calculations.i.toFixed(2)} mm</span>
        </div>
      </div>
    </div>
  )
}
