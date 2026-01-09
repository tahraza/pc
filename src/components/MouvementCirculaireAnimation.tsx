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

export function MouvementCirculaireAnimation() {
  // Paramètres
  const [radius, setRadius] = useState(150) // pixels
  const [omega, setOmega] = useState(1.5) // rad/s (vitesse angulaire)
  const [isUniform, setIsUniform] = useState(true) // MCU ou non
  const [showFrenet, setShowFrenet] = useState(true)
  const [showAcceleration, setShowAcceleration] = useState(true)
  const [showTrajectory, setShowTrajectory] = useState(true)
  const [animating, setAnimating] = useState(false)

  // État de l'animation
  const [angle, setAngle] = useState(0)
  const [angularAccel, setAngularAccel] = useState(0) // Pour mouvement non uniforme
  const animRef = useRef<number>()
  const lastTimeRef = useRef<number>(0)

  // Animation
  useEffect(() => {
    if (animating) {
      lastTimeRef.current = performance.now()
      const animate = (time: number) => {
        const dt = (time - lastTimeRef.current) / 1000
        lastTimeRef.current = time

        setAngle(prev => {
          if (isUniform) {
            return (prev + omega * dt) % (2 * Math.PI)
          } else {
            // Mouvement non uniforme : accélération sinusoïdale
            const accel = Math.sin(prev * 2) * 2
            setAngularAccel(accel)
            return (prev + (omega + accel * 0.1) * dt) % (2 * Math.PI)
          }
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
  }, [animating, omega, isUniform])

  // Calculs
  const calculations = useMemo(() => {
    const v = radius * omega / 50 // Vitesse linéaire (normalisée)
    const T = (2 * Math.PI) / omega // Période
    const f = 1 / T // Fréquence
    const an = (v * v) / (radius / 50) // Accélération normale
    const at = isUniform ? 0 : angularAccel * radius / 50 // Accélération tangentielle

    return { v, T, f, an, at }
  }, [radius, omega, isUniform, angularAccel])

  // Dimensions SVG
  const svgWidth = 1000
  const svgHeight = 580
  const centerX = 400
  const centerY = 290

  // Position du point M
  const mx = centerX + radius * Math.cos(angle)
  const my = centerY - radius * Math.sin(angle)

  // Vecteurs du repère de Frenet
  const vecScale = 60

  // Vecteur tangent t (perpendiculaire au rayon, sens du mouvement)
  const tx = -Math.sin(angle) * vecScale
  const ty = -Math.cos(angle) * vecScale

  // Vecteur normal n (vers le centre)
  const nx = -Math.cos(angle) * vecScale
  const ny = Math.sin(angle) * vecScale

  // Vecteur vitesse (tangent)
  const vScale = calculations.v * 30
  const vx = -Math.sin(angle) * vScale
  const vy = -Math.cos(angle) * vScale

  // Accélération normale (centripète)
  const anScale = calculations.an * 15
  const anx = -Math.cos(angle) * anScale
  const any = Math.sin(angle) * anScale

  // Accélération tangentielle (si non uniforme)
  const atScale = calculations.at * 15
  const atx = -Math.sin(angle) * atScale
  const aty = -Math.cos(angle) * atScale

  // Trajectoire (points précédents)
  const [trail, setTrail] = useState<{x: number, y: number}[]>([])

  useEffect(() => {
    if (animating && showTrajectory) {
      setTrail(prev => {
        const newTrail = [...prev, { x: mx, y: my }]
        return newTrail.slice(-100) // Garder les 100 derniers points
      })
    }
  }, [mx, my, animating, showTrajectory])

  return (
    <div className="my-8 rounded-xl overflow-hidden" style={{ background: 'linear-gradient(180deg, #0e1117 0%, #161b22 100%)' }}>
      {/* Header */}
      <div className="px-4 py-3 border-b border-slate-700/50">
        <h3 className="text-lg font-semibold text-slate-100">
          Mouvement Circulaire — Repère de Frenet
        </h3>
        <p className="text-sm text-slate-400 mt-1">
          Décomposition de l'accélération en composantes tangentielle et normale
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
              <marker id="arrowT" markerWidth="10" markerHeight="10" refX="9" refY="5" orient="auto">
                <path d="M0,0 L10,5 L0,10 Z" fill="#22c55e" />
              </marker>
              <marker id="arrowN" markerWidth="10" markerHeight="10" refX="9" refY="5" orient="auto">
                <path d="M0,0 L10,5 L0,10 Z" fill="#f97316" />
              </marker>
              <marker id="arrowV" markerWidth="10" markerHeight="10" refX="9" refY="5" orient="auto">
                <path d="M0,0 L10,5 L0,10 Z" fill="#60a5fa" />
              </marker>
              <marker id="arrowAn" markerWidth="10" markerHeight="10" refX="9" refY="5" orient="auto">
                <path d="M0,0 L10,5 L0,10 Z" fill="#ef4444" />
              </marker>
              <marker id="arrowAt" markerWidth="10" markerHeight="10" refX="9" refY="5" orient="auto">
                <path d="M0,0 L10,5 L0,10 Z" fill="#a855f7" />
              </marker>
            </defs>

            {/* Grille de fond */}
            <g opacity="0.1">
              {Array.from({ length: 21 }).map((_, i) => (
                <line key={`v${i}`} x1={50 + i * 40} y1={40} x2={50 + i * 40} y2={540} stroke="white" strokeWidth="1" />
              ))}
              {Array.from({ length: 14 }).map((_, i) => (
                <line key={`h${i}`} x1={50} y1={40 + i * 40} x2={850} y2={40 + i * 40} stroke="white" strokeWidth="1" />
              ))}
            </g>

            {/* Trajectoire circulaire */}
            <circle
              cx={centerX}
              cy={centerY}
              r={radius}
              fill="none"
              stroke="#475569"
              strokeWidth="2"
              strokeDasharray="8 4"
            />

            {/* Trace du mouvement */}
            {showTrajectory && trail.length > 1 && (
              <polyline
                points={trail.map(p => `${p.x},${p.y}`).join(' ')}
                fill="none"
                stroke="#60a5fa"
                strokeWidth="2"
                opacity="0.4"
              />
            )}

            {/* Centre O */}
            <circle cx={centerX} cy={centerY} r="5" fill="#64748b" />
            <text x={centerX - 15} y={centerY + 5} fill="#94a3b8" fontSize="14" fontWeight="bold">O</text>

            {/* Rayon OM */}
            <line
              x1={centerX}
              y1={centerY}
              x2={mx}
              y2={my}
              stroke="#64748b"
              strokeWidth="1.5"
              strokeDasharray="6 3"
            />
            <text
              x={(centerX + mx) / 2 - 15}
              y={(centerY + my) / 2 - 10}
              fill="#64748b"
              fontSize="12"
            >
              R = {(radius / 50).toFixed(1)} m
            </text>

            {/* Point M (mobile) */}
            <circle cx={mx} cy={my} r="10" fill="#3b82f6" stroke="white" strokeWidth="2" />
            <text x={mx + 15} y={my - 15} fill="#e2e8f0" fontSize="14" fontWeight="bold">M</text>

            {/* Repère de Frenet */}
            {showFrenet && (
              <>
                {/* Vecteur tangent t */}
                <line
                  x1={mx}
                  y1={my}
                  x2={mx + tx}
                  y2={my + ty}
                  stroke="#22c55e"
                  strokeWidth="3"
                  markerEnd="url(#arrowT)"
                />
                <text x={mx + tx + 10} y={my + ty} fill="#22c55e" fontSize="14" fontWeight="bold">t⃗</text>

                {/* Vecteur normal n */}
                <line
                  x1={mx}
                  y1={my}
                  x2={mx + nx}
                  y2={my + ny}
                  stroke="#f97316"
                  strokeWidth="3"
                  markerEnd="url(#arrowN)"
                />
                <text x={mx + nx + 10} y={my + ny} fill="#f97316" fontSize="14" fontWeight="bold">n⃗</text>
              </>
            )}

            {/* Vecteur vitesse */}
            <line
              x1={mx}
              y1={my}
              x2={mx + vx}
              y2={my + vy}
              stroke="#60a5fa"
              strokeWidth="4"
              markerEnd="url(#arrowV)"
            />
            <text x={mx + vx + 10} y={my + vy - 5} fill="#60a5fa" fontSize="14" fontWeight="bold">v⃗</text>

            {/* Accélération */}
            {showAcceleration && (
              <>
                {/* Accélération normale (centripète) */}
                <line
                  x1={mx}
                  y1={my}
                  x2={mx + anx}
                  y2={my + any}
                  stroke="#ef4444"
                  strokeWidth="3"
                  markerEnd="url(#arrowAn)"
                />
                <text x={mx + anx - 25} y={my + any + 15} fill="#ef4444" fontSize="12" fontWeight="bold">aₙ</text>

                {/* Accélération tangentielle (si non uniforme) */}
                {!isUniform && Math.abs(atScale) > 5 && (
                  <>
                    <line
                      x1={mx}
                      y1={my}
                      x2={mx + atx}
                      y2={my + aty}
                      stroke="#a855f7"
                      strokeWidth="3"
                      markerEnd="url(#arrowAt)"
                    />
                    <text x={mx + atx + 10} y={my + aty} fill="#a855f7" fontSize="12" fontWeight="bold">aₜ</text>
                  </>
                )}
              </>
            )}

            {/* Légende */}
            <g transform="translate(30, 30)">
              <rect x={0} y={0} width={220} height={140} rx={8} fill="rgba(0,0,0,0.6)" />
              <text x={15} y={25} fill="#e2e8f0" fontSize="13" fontWeight="600">Repère de Frenet</text>

              <line x1={15} y1={45} x2={50} y2={45} stroke="#22c55e" strokeWidth="3" markerEnd="url(#arrowT)" />
              <text x={60} y={50} fill="#22c55e" fontSize="11">t⃗ tangent (sens du mvt)</text>

              <line x1={15} y1={70} x2={50} y2={70} stroke="#f97316" strokeWidth="3" markerEnd="url(#arrowN)" />
              <text x={60} y={75} fill="#f97316" fontSize="11">n⃗ normal (vers le centre)</text>

              <line x1={15} y1={95} x2={50} y2={95} stroke="#60a5fa" strokeWidth="3" markerEnd="url(#arrowV)" />
              <text x={60} y={100} fill="#60a5fa" fontSize="11">v⃗ = v·t⃗</text>

              <line x1={15} y1={120} x2={50} y2={120} stroke="#ef4444" strokeWidth="3" markerEnd="url(#arrowAn)" />
              <text x={60} y={125} fill="#ef4444" fontSize="11">aₙ = v²/R (centripète)</text>
            </g>

            {/* Résultats */}
            <g transform={`translate(${svgWidth - 300}, 30)`}>
              <rect x={0} y={0} width={270} height={180} rx={8} fill="rgba(0,0,0,0.6)" stroke="rgba(255,255,255,0.1)" />
              <text x={15} y={25} fill="#e2e8f0" fontSize="14" fontWeight="600">
                {isUniform ? 'MCU (Mouvement Circulaire Uniforme)' : 'Mouvement Circulaire Non Uniforme'}
              </text>

              <text x={15} y={55} fill="#94a3b8" fontSize="12">Vitesse linéaire :</text>
              <text x={15} y={75} fill="#60a5fa" fontSize="14" fontFamily="monospace">
                v = Rω = {calculations.v.toFixed(2)} m/s
              </text>

              <text x={15} y={100} fill="#94a3b8" fontSize="12">Accélération normale :</text>
              <text x={15} y={120} fill="#ef4444" fontSize="14" fontFamily="monospace">
                aₙ = v²/R = {calculations.an.toFixed(2)} m/s²
              </text>

              <text x={15} y={145} fill="#94a3b8" fontSize="12">Période / Fréquence :</text>
              <text x={15} y={165} fill="#22c55e" fontSize="14" fontFamily="monospace">
                T = {calculations.T.toFixed(2)} s | f = {calculations.f.toFixed(2)} Hz
              </text>
            </g>

            {/* Formule principale */}
            <g transform={`translate(${svgWidth - 300}, 230)`}>
              <rect x={0} y={0} width={270} height={100} rx={8} fill="rgba(239, 68, 68, 0.15)" stroke="rgba(239, 68, 68, 0.3)" />
              <text x={15} y={25} fill="#fca5a5" fontSize="12" fontWeight="600">FORMULE CLÉ (Frenet)</text>
              <text x={15} y={55} fill="#fef2f2" fontSize="16" fontFamily="monospace">
                a⃗ = (dv/dt)·t⃗ + (v²/R)·n⃗
              </text>
              <text x={15} y={80} fill="#fca5a5" fontSize="11">
                {isUniform ? 'MCU : dv/dt = 0 → a⃗ = (v²/R)·n⃗' : 'Non uniforme : aₜ ≠ 0'}
              </text>
            </g>

            {/* Indication angle */}
            <text x={centerX + 20} y={centerY - radius - 15} fill="#64748b" fontSize="11">
              θ = {(angle * 180 / Math.PI).toFixed(0)}°
            </text>
          </svg>
        </div>

        {/* Controls Panel */}
        <div className="p-4 pt-2 border-t border-slate-700/50 bg-slate-900/50">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Paramètres du mouvement */}
            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Paramètres</h4>
              <Slider
                label="R (rayon)"
                value={radius / 50}
                min={1}
                max={4}
                step={0.1}
                unit="m"
                onChange={(v) => setRadius(v * 50)}
              />
              <Slider
                label="ω (vitesse angulaire)"
                value={omega}
                min={0.5}
                max={4}
                step={0.1}
                unit="rad/s"
                onChange={setOmega}
              />
            </div>

            {/* Type de mouvement */}
            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Type de mouvement</h4>
              <div className="flex gap-2">
                <button
                  onClick={() => setIsUniform(true)}
                  className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors
                    ${isUniform ? 'bg-green-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}
                >
                  MCU
                </button>
                <button
                  onClick={() => setIsUniform(false)}
                  className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors
                    ${!isUniform ? 'bg-purple-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}
                >
                  Non uniforme
                </button>
              </div>
              <p className="text-xs text-slate-500">
                {isUniform ? 'v = constante, aₜ = 0' : 'v varie, aₜ ≠ 0'}
              </p>
            </div>

            {/* Affichage */}
            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Affichage</h4>
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm text-slate-300">
                  <input
                    type="checkbox"
                    checked={showFrenet}
                    onChange={(e) => setShowFrenet(e.target.checked)}
                    className="rounded border-slate-600 bg-slate-800"
                  />
                  Repère de Frenet (t⃗, n⃗)
                </label>
                <label className="flex items-center gap-2 text-sm text-slate-300">
                  <input
                    type="checkbox"
                    checked={showAcceleration}
                    onChange={(e) => setShowAcceleration(e.target.checked)}
                    className="rounded border-slate-600 bg-slate-800"
                  />
                  Accélération aₙ
                </label>
                <label className="flex items-center gap-2 text-sm text-slate-300">
                  <input
                    type="checkbox"
                    checked={showTrajectory}
                    onChange={(e) => { setShowTrajectory(e.target.checked); setTrail([]); }}
                    className="rounded border-slate-600 bg-slate-800"
                  />
                  Trace du mouvement
                </label>
              </div>
            </div>

            {/* Animation */}
            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Animation</h4>
              <button
                onClick={() => { setAnimating(!animating); if (!animating) setTrail([]); }}
                className={`w-full px-4 py-2 rounded-lg font-medium transition-colors
                  ${animating ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'} text-white`}
              >
                {animating ? '⏸ Pause' : '▶ Animer'}
              </button>
              <button
                onClick={() => { setAngle(0); setTrail([]); }}
                className="w-full px-4 py-2 rounded-lg font-medium bg-slate-700 hover:bg-slate-600 text-white"
              >
                ↺ Réinitialiser
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-slate-700/50 flex items-center justify-between">
        <div className="text-sm text-slate-400">
          <span className={isUniform ? 'text-green-400' : 'text-purple-400'}>
            {isUniform ? 'MCU : v⃗ ⊥ a⃗' : 'MCNU : a⃗ a une composante tangentielle'}
          </span>
        </div>
        <div className="text-xs text-slate-500">
          aₙ = v²/R = <span className="text-red-400 font-mono">{calculations.an.toFixed(2)} m/s²</span>
        </div>
      </div>
    </div>
  )
}
