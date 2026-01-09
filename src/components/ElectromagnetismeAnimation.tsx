'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import { MathInline } from './SvgMath'

interface SliderProps {
  label: string
  value: number
  min: number
  max: number
  step: number
  unit: string
  onChange: (value: number) => void
}

function Slider({ label, value, min, max, step, unit, onChange }: SliderProps) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className="text-slate-400">{label}</span>
        <span className="font-mono text-slate-200">{value.toFixed(step < 1 ? 2 : 0)} {unit}</span>
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
                   [&::-webkit-slider-thumb]:bg-blue-500 [&::-webkit-slider-thumb]:cursor-pointer"
      />
    </div>
  )
}

export function ElectromagnetismeAnimation() {
  // Paramètres physiques
  const [B, setB] = useState(0.5) // Tesla
  const [v0, setV0] = useState(1.0) // ×10^6 m/s
  const [charge, setCharge] = useState(1) // +1 (proton) ou -1 (électron)
  const [mass, setMass] = useState(1) // 1 = proton, 0.0005 = électron (ratio)
  const [showField, setShowField] = useState(true)
  const [showForce, setShowForce] = useState(true)
  const [animating, setAnimating] = useState(false)

  // Position de la particule (angle sur le cercle)
  const [angle, setAngle] = useState(0)
  const animRef = useRef<number>()

  // Calculs physiques
  const calculations = useMemo(() => {
    // Rayon R = mv / (|q|B)
    // On utilise des unités normalisées pour la visualisation
    const massReal = mass * 1.67e-27 // kg (proton = 1)
    const vReal = v0 * 1e6 // m/s
    const qReal = Math.abs(charge) * 1.6e-19 // C

    const R = (massReal * vReal) / (qReal * B)
    const T = (2 * Math.PI * massReal) / (qReal * B) // Période cyclotron
    const f = 1 / T // Fréquence cyclotron

    return { R, T, f, massReal, vReal, qReal }
  }, [B, v0, charge, mass])

  // Animation
  useEffect(() => {
    if (animating) {
      const animate = () => {
        setAngle(prev => {
          const speed = 0.03 * (charge > 0 ? 1 : -1) // Direction selon le signe
          return (prev + speed) % (2 * Math.PI)
        })
        animRef.current = requestAnimationFrame(animate)
      }
      animRef.current = requestAnimationFrame(animate)
    } else {
      if (animRef.current) cancelAnimationFrame(animRef.current)
    }
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current)
    }
  }, [animating, charge])

  // Dimensions SVG
  const svgWidth = 1000
  const svgHeight = 580
  const centerX = 400
  const centerY = 290

  // Rayon visuel (normalisé pour l'affichage)
  const visualRadius = Math.min(200, Math.max(50, 100 * (calculations.R * 1e3))) // Adapté pour visualisation

  // Position de la particule
  const particleX = centerX + visualRadius * Math.cos(angle)
  const particleY = centerY - visualRadius * Math.sin(angle)

  // Vecteur vitesse (tangent au cercle)
  const vScale = 50
  const vx = -Math.sin(angle) * vScale * (charge > 0 ? 1 : -1)
  const vy = -Math.cos(angle) * vScale * (charge > 0 ? 1 : -1)

  // Force de Lorentz (perpendiculaire à v, vers le centre pour q > 0)
  const fScale = 40
  const fx = -Math.cos(angle) * fScale
  const fy = Math.sin(angle) * fScale

  return (
    <div className="my-8 rounded-xl overflow-hidden" style={{ background: 'linear-gradient(180deg, #0e1117 0%, #161b22 100%)' }}>
      {/* Header */}
      <div className="px-4 py-3 border-b border-slate-700/50">
        <h3 className="text-lg font-semibold text-slate-100">
          Force de Lorentz — Particule chargée dans un champ magnétique
        </h3>
        <p className="text-sm text-slate-400 mt-1">
          Trajectoire circulaire et déviation magnétique
        </p>
      </div>

      <div className="flex flex-col">
        {/* SVG Visualization */}
        <div className="p-4 pb-2">
          <svg
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            className="w-full h-auto min-h-[400px]"
            style={{ background: 'transparent' }}
          >
            <defs>
              <marker id="arrowBlue" markerWidth="10" markerHeight="10" refX="9" refY="5" orient="auto">
                <path d="M0,0 L10,5 L0,10 Z" fill="#60a5fa" />
              </marker>
              <marker id="arrowRed" markerWidth="10" markerHeight="10" refX="9" refY="5" orient="auto">
                <path d="M0,0 L10,5 L0,10 Z" fill="#f87171" />
              </marker>
              <marker id="arrowGreen" markerWidth="10" markerHeight="10" refX="9" refY="5" orient="auto">
                <path d="M0,0 L10,5 L0,10 Z" fill="#4ade80" />
              </marker>
            </defs>

            {/* Champ magnétique B (croix = entrant dans l'écran) */}
            {showField && (
              <g>
                {Array.from({ length: 12 }).map((_, i) =>
                  Array.from({ length: 8 }).map((_, j) => {
                    const x = 100 + i * 55
                    const y = 70 + j * 60
                    return (
                      <g key={`${i}-${j}`} transform={`translate(${x}, ${y})`}>
                        <circle r="8" fill="none" stroke="#a78bfa" strokeWidth="1" opacity="0.4" />
                        <line x1="-5" y1="-5" x2="5" y2="5" stroke="#a78bfa" strokeWidth="1.5" opacity="0.6" />
                        <line x1="5" y1="-5" x2="-5" y2="5" stroke="#a78bfa" strokeWidth="1.5" opacity="0.6" />
                      </g>
                    )
                  })
                )}
                <text x={svgWidth - 180} y={50} fill="#a78bfa" fontSize="14">
                  ⊗ Champ B (entrant)
                </text>
                <text x={svgWidth - 180} y={70} fill="#a78bfa" fontSize="12" opacity="0.8">
                  B = {B.toFixed(2)} T
                </text>
              </g>
            )}

            {/* Trajectoire circulaire */}
            <circle
              cx={centerX}
              cy={centerY}
              r={visualRadius}
              fill="none"
              stroke="#475569"
              strokeWidth="2"
              strokeDasharray="8 4"
            />

            {/* Centre de la trajectoire */}
            <circle cx={centerX} cy={centerY} r="4" fill="#64748b" />
            <text x={centerX + 10} y={centerY + 5} fill="#64748b" fontSize="12">O</text>

            {/* Rayon */}
            <line
              x1={centerX}
              y1={centerY}
              x2={particleX}
              y2={particleY}
              stroke="#64748b"
              strokeWidth="1"
              strokeDasharray="4 4"
            />
            <text
              x={(centerX + particleX) / 2 + 10}
              y={(centerY + particleY) / 2}
              fill="#64748b"
              fontSize="11"
            >
              R
            </text>

            {/* Particule */}
            <circle
              cx={particleX}
              cy={particleY}
              r="12"
              fill={charge > 0 ? '#ef4444' : '#3b82f6'}
              stroke="white"
              strokeWidth="2"
            />
            <text
              x={particleX}
              y={particleY + 5}
              fill="white"
              fontSize="14"
              fontWeight="bold"
              textAnchor="middle"
            >
              {charge > 0 ? '+' : '−'}
            </text>

            {/* Vecteur vitesse v */}
            <line
              x1={particleX}
              y1={particleY}
              x2={particleX + vx}
              y2={particleY + vy}
              stroke="#60a5fa"
              strokeWidth="3"
              markerEnd="url(#arrowBlue)"
            />
            <text
              x={particleX + vx + 10}
              y={particleY + vy}
              fill="#60a5fa"
              fontSize="14"
              fontWeight="bold"
            >
              v⃗
            </text>

            {/* Force de Lorentz f */}
            {showForce && (
              <>
                <line
                  x1={particleX}
                  y1={particleY}
                  x2={particleX + fx}
                  y2={particleY + fy}
                  stroke="#4ade80"
                  strokeWidth="3"
                  markerEnd="url(#arrowGreen)"
                />
                <text
                  x={particleX + fx + 10}
                  y={particleY + fy}
                  fill="#4ade80"
                  fontSize="14"
                  fontWeight="bold"
                >
                  F⃗
                </text>
              </>
            )}

            {/* Légende */}
            <g transform="translate(30, 30)">
              <rect x={0} y={0} width={200} height={100} rx={8} fill="rgba(0,0,0,0.5)" />
              <circle cx={20} cy={25} r={8} fill={charge > 0 ? '#ef4444' : '#3b82f6'} />
              <text x={35} y={30} fill="#e2e8f0" fontSize="12">
                {charge > 0 ? 'Charge positive (proton)' : 'Charge négative (électron)'}
              </text>
              <line x1={15} y1={50} x2={45} y2={50} stroke="#60a5fa" strokeWidth="3" markerEnd="url(#arrowBlue)" />
              <text x={55} y={55} fill="#60a5fa" fontSize="12">Vitesse v⃗ (tangente)</text>
              <line x1={15} y1={75} x2={45} y2={75} stroke="#4ade80" strokeWidth="3" markerEnd="url(#arrowGreen)" />
              <text x={55} y={80} fill="#4ade80" fontSize="12">Force F⃗ = qv⃗ × B⃗ (centripète)</text>
            </g>

            {/* Formules et résultats */}
            <g transform={`translate(${svgWidth - 300}, 120)`}>
              <rect x={0} y={0} width={270} height={180} rx={8} fill="rgba(0,0,0,0.6)" stroke="rgba(255,255,255,0.1)" />
              <text x={15} y={28} fill="#e2e8f0" fontSize="14" fontWeight="600">
                Résultats
              </text>

              <text x={15} y={55} fill="#94a3b8" fontSize="12">Rayon de courbure :</text>
              <text x={15} y={75} fill="#22c55e" fontSize="14" fontFamily="monospace">
                R = mv/(|q|B) = {(calculations.R * 1000).toFixed(2)} mm
              </text>

              <text x={15} y={100} fill="#94a3b8" fontSize="12">Période cyclotron :</text>
              <text x={15} y={120} fill="#fbbf24" fontSize="14" fontFamily="monospace">
                T = 2πm/(|q|B) = {(calculations.T * 1e9).toFixed(2)} ns
              </text>

              <text x={15} y={145} fill="#94a3b8" fontSize="12">Fréquence cyclotron :</text>
              <text x={15} y={165} fill="#a78bfa" fontSize="14" fontFamily="monospace">
                f = {(calculations.f / 1e6).toFixed(2)} MHz
              </text>
            </g>

            {/* Explication physique */}
            <g transform={`translate(${svgWidth - 300}, 320)`}>
              <rect x={0} y={0} width={270} height={130} rx={8} fill="rgba(59, 130, 246, 0.15)" stroke="rgba(59, 130, 246, 0.3)" />
              <text x={15} y={25} fill="#93c5fd" fontSize="12" fontWeight="600">
                PROPRIÉTÉS CLÉS
              </text>
              <text x={15} y={48} fill="#bfdbfe" fontSize="11">• F⃗ ⊥ v⃗ → trajectoire circulaire</text>
              <text x={15} y={68} fill="#bfdbfe" fontSize="11">• W(F⃗) = 0 → |v| = constante</text>
              <text x={15} y={88} fill="#bfdbfe" fontSize="11">• B dévie sans accélérer</text>
              <text x={15} y={108} fill="#bfdbfe" fontSize="11">• Sens : règle de la main droite</text>
            </g>

            {/* Indication direction du mouvement */}
            <text x={centerX} y={centerY - visualRadius - 20} fill="#64748b" fontSize="11" textAnchor="middle">
              {charge > 0 ? '↺ Sens antihoraire (q > 0)' : '↻ Sens horaire (q < 0)'}
            </text>
          </svg>
        </div>

        {/* Controls Panel */}
        <div className="p-4 pt-2 border-t border-slate-700/50 bg-slate-900/50">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Paramètres du champ */}
            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Champ magnétique</h4>
              <Slider
                label="B (champ magnétique)"
                value={B}
                min={0.1}
                max={2.0}
                step={0.1}
                unit="T"
                onChange={setB}
              />
              <Slider
                label="v₀ (vitesse initiale)"
                value={v0}
                min={0.5}
                max={5.0}
                step={0.1}
                unit="×10⁶ m/s"
                onChange={setV0}
              />
            </div>

            {/* Type de particule */}
            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Particule</h4>
              <div className="flex gap-2">
                <button
                  onClick={() => { setCharge(1); setMass(1); }}
                  className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors
                    ${charge > 0 ? 'bg-red-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}
                >
                  Proton (+)
                </button>
                <button
                  onClick={() => { setCharge(-1); setMass(0.000545); }}
                  className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors
                    ${charge < 0 ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}
                >
                  Électron (−)
                </button>
              </div>
              <div className="text-xs text-slate-400">
                m = {mass === 1 ? '1,67×10⁻²⁷ kg' : '9,11×10⁻³¹ kg'}
              </div>
            </div>

            {/* Formules */}
            <div className="p-3 rounded-lg bg-slate-800/80 border border-slate-700">
              <h5 className="text-xs font-semibold text-slate-400 mb-2">FORMULES</h5>
              <div className="space-y-2 text-xs text-slate-300">
                <div><MathInline>{String.raw`\vec{F} = q\vec{v} \times \vec{B}`}</MathInline></div>
                <div><MathInline>{String.raw`F = |q|vB`}</MathInline> (si <MathInline>{String.raw`\vec{v} \perp \vec{B}`}</MathInline>)</div>
                <div className="text-green-400"><MathInline>{String.raw`R = \frac{mv}{|q|B}`}</MathInline></div>
                <div className="text-yellow-400"><MathInline>{String.raw`T = \frac{2\pi m}{|q|B}`}</MathInline></div>
              </div>
            </div>

            {/* Contrôles */}
            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Animation</h4>
              <button
                onClick={() => setAnimating(!animating)}
                className={`w-full px-4 py-2 rounded-lg font-medium transition-colors
                  ${animating ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'} text-white`}
              >
                {animating ? '⏸ Pause' : '▶ Animer'}
              </button>
              <div className="flex flex-col gap-2">
                <label className="flex items-center gap-2 text-sm text-slate-300">
                  <input
                    type="checkbox"
                    checked={showField}
                    onChange={(e) => setShowField(e.target.checked)}
                    className="rounded border-slate-600 bg-slate-800"
                  />
                  Afficher champ B
                </label>
                <label className="flex items-center gap-2 text-sm text-slate-300">
                  <input
                    type="checkbox"
                    checked={showForce}
                    onChange={(e) => setShowForce(e.target.checked)}
                    className="rounded border-slate-600 bg-slate-800"
                  />
                  Afficher force F
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-slate-700/50 flex items-center justify-between">
        <div className="text-sm text-slate-400">
          Particule : <span className={charge > 0 ? 'text-red-400' : 'text-blue-400'}>
            {charge > 0 ? 'Proton' : 'Électron'}
          </span>
        </div>
        <div className="text-xs text-slate-500">
          Rayon : <span className="text-green-400 font-mono">{(calculations.R * 1000).toFixed(2)} mm</span>
        </div>
      </div>
    </div>
  )
}
