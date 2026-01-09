'use client'

import { useState, useEffect, useRef, useMemo } from 'react'

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
        <span className="font-mono text-slate-200">{value.toFixed(step < 1 ? 1 : 0)} {unit}</span>
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

export function TrajectoireParaboliqueAnimation() {
  const g = 9.81 // m/s²

  // Paramètres
  const [v0, setV0] = useState(20) // m/s
  const [angle, setAngle] = useState(45) // degrés
  const [y0, setY0] = useState(0) // hauteur initiale
  const [showVectors, setShowVectors] = useState(true)
  const [showDecomposition, setShowDecomposition] = useState(true)
  const [animating, setAnimating] = useState(false)

  // État de l'animation
  const [time, setTime] = useState(0)
  const animRef = useRef<number>()
  const lastTimeRef = useRef<number>(0)

  // Calculs physiques
  const calculations = useMemo(() => {
    const angleRad = angle * Math.PI / 180
    const v0x = v0 * Math.cos(angleRad)
    const v0y = v0 * Math.sin(angleRad)

    // Temps de vol (quand y = 0, en résolvant -0.5gt² + v0y*t + y0 = 0)
    const discriminant = v0y * v0y + 2 * g * y0
    const tVol = (v0y + Math.sqrt(discriminant)) / g

    // Flèche (altitude max)
    const tFlèche = v0y / g
    const H = y0 + (v0y * v0y) / (2 * g)

    // Portée
    const P = v0x * tVol

    return { v0x, v0y, tVol, tFlèche, H, P, angleRad }
  }, [v0, angle, y0])

  // Position à l'instant t
  const getPosition = (t: number) => {
    const x = calculations.v0x * t
    const y = y0 + calculations.v0y * t - 0.5 * g * t * t
    return { x, y }
  }

  // Vitesse à l'instant t
  const getVelocity = (t: number) => {
    const vx = calculations.v0x
    const vy = calculations.v0y - g * t
    return { vx, vy, v: Math.sqrt(vx * vx + vy * vy) }
  }

  // Animation
  useEffect(() => {
    if (animating) {
      lastTimeRef.current = performance.now()
      const animate = (currentTime: number) => {
        const dt = (currentTime - lastTimeRef.current) / 1000
        lastTimeRef.current = currentTime

        setTime(prev => {
          const newTime = prev + dt * 0.5 // Ralentir l'animation
          if (newTime > calculations.tVol) {
            setAnimating(false)
            return calculations.tVol
          }
          return newTime
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
  }, [animating, calculations.tVol])

  // Dimensions SVG
  const svgWidth = 1000
  const svgHeight = 550
  const margin = { top: 40, right: 60, bottom: 60, left: 80 }

  // Échelles (adapter selon portée et flèche)
  const maxX = Math.max(calculations.P * 1.1, 50)
  const maxY = Math.max(calculations.H * 1.2, 30)

  const scaleX = (x: number) => margin.left + (x / maxX) * (svgWidth - margin.left - margin.right)
  const scaleY = (y: number) => svgHeight - margin.bottom - (y / maxY) * (svgHeight - margin.top - margin.bottom)

  // Position actuelle du projectile
  const currentPos = getPosition(time)
  const currentVel = getVelocity(time)
  const projX = scaleX(currentPos.x)
  const projY = scaleY(Math.max(0, currentPos.y))

  // Générer la trajectoire complète
  const trajectoryPoints = useMemo(() => {
    const points: string[] = []
    for (let t = 0; t <= calculations.tVol; t += calculations.tVol / 100) {
      const pos = getPosition(t)
      if (pos.y >= 0) {
        points.push(`${scaleX(pos.x)},${scaleY(pos.y)}`)
      }
    }
    return points.join(' ')
  }, [calculations, scaleX, scaleY])

  // Échelle des vecteurs
  const vecScale = 3

  return (
    <div className="my-8 rounded-xl overflow-hidden" style={{ background: 'linear-gradient(180deg, #0e1117 0%, #161b22 100%)' }}>
      {/* Header */}
      <div className="px-4 py-3 border-b border-slate-700/50">
        <h3 className="text-lg font-semibold text-slate-100">
          Trajectoire Parabolique — Mouvement dans un champ uniforme
        </h3>
        <p className="text-sm text-slate-400 mt-1">
          Tir de projectile avec décomposition du mouvement
        </p>
      </div>

      <div className="flex flex-col">
        {/* SVG Visualization */}
        <div className="p-4 pb-2">
          <svg
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            className="w-full h-auto min-h-[380px]"
            style={{ background: 'transparent' }}
          >
            <defs>
              <marker id="arrowVel" markerWidth="10" markerHeight="10" refX="9" refY="5" orient="auto">
                <path d="M0,0 L10,5 L0,10 Z" fill="#60a5fa" />
              </marker>
              <marker id="arrowVx" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
                <path d="M0,0 L8,4 L0,8 Z" fill="#22c55e" />
              </marker>
              <marker id="arrowVy" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
                <path d="M0,0 L8,4 L0,8 Z" fill="#f97316" />
              </marker>
              <marker id="arrowG" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
                <path d="M0,0 L8,4 L0,8 Z" fill="#ef4444" />
              </marker>
              <linearGradient id="skyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#1e3a5f" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#0f172a" stopOpacity="0.1" />
              </linearGradient>
            </defs>

            {/* Fond ciel */}
            <rect x={margin.left} y={margin.top} width={svgWidth - margin.left - margin.right} height={svgHeight - margin.top - margin.bottom} fill="url(#skyGradient)" />

            {/* Grille */}
            <g opacity="0.15">
              {Array.from({ length: 11 }).map((_, i) => {
                const x = margin.left + (i / 10) * (svgWidth - margin.left - margin.right)
                return <line key={`v${i}`} x1={x} y1={margin.top} x2={x} y2={svgHeight - margin.bottom} stroke="white" strokeWidth="1" />
              })}
              {Array.from({ length: 11 }).map((_, i) => {
                const y = margin.top + (i / 10) * (svgHeight - margin.top - margin.bottom)
                return <line key={`h${i}`} x1={margin.left} y1={y} x2={svgWidth - margin.right} y2={y} stroke="white" strokeWidth="1" />
              })}
            </g>

            {/* Sol */}
            <line
              x1={margin.left}
              y1={scaleY(0)}
              x2={svgWidth - margin.right}
              y2={scaleY(0)}
              stroke="#4ade80"
              strokeWidth="3"
            />
            <rect
              x={margin.left}
              y={scaleY(0)}
              width={svgWidth - margin.left - margin.right}
              height={svgHeight - scaleY(0) - margin.bottom + 10}
              fill="#166534"
              opacity="0.3"
            />

            {/* Axes */}
            <line x1={margin.left} y1={scaleY(0)} x2={svgWidth - margin.right + 20} y2={scaleY(0)} stroke="#64748b" strokeWidth="2" />
            <line x1={margin.left} y1={scaleY(0)} x2={margin.left} y2={margin.top - 10} stroke="#64748b" strokeWidth="2" />
            <text x={svgWidth - margin.right + 10} y={scaleY(0) - 10} fill="#94a3b8" fontSize="14">x (m)</text>
            <text x={margin.left + 10} y={margin.top} fill="#94a3b8" fontSize="14">y (m)</text>

            {/* Graduations */}
            {[0, 0.25, 0.5, 0.75, 1].map(frac => {
              const xVal = frac * maxX
              const x = scaleX(xVal)
              return (
                <g key={`gx${frac}`}>
                  <line x1={x} y1={scaleY(0)} x2={x} y2={scaleY(0) + 8} stroke="#64748b" strokeWidth="1" />
                  <text x={x} y={scaleY(0) + 22} fill="#64748b" fontSize="11" textAnchor="middle">
                    {xVal.toFixed(0)}
                  </text>
                </g>
              )
            })}
            {[0, 0.25, 0.5, 0.75, 1].map(frac => {
              const yVal = frac * maxY
              const y = scaleY(yVal)
              return (
                <g key={`gy${frac}`}>
                  <line x1={margin.left - 8} y1={y} x2={margin.left} y2={y} stroke="#64748b" strokeWidth="1" />
                  <text x={margin.left - 12} y={y + 4} fill="#64748b" fontSize="11" textAnchor="end">
                    {yVal.toFixed(0)}
                  </text>
                </g>
              )
            })}

            {/* Trajectoire (parabole) */}
            <polyline
              points={trajectoryPoints}
              fill="none"
              stroke="#fbbf24"
              strokeWidth="2"
              strokeDasharray="6 3"
              opacity="0.7"
            />

            {/* Point de départ */}
            <circle cx={scaleX(0)} cy={scaleY(y0)} r="6" fill="#22c55e" />

            {/* Flèche (point culminant) */}
            <g>
              <line
                x1={scaleX(calculations.v0x * calculations.tFlèche)}
                y1={scaleY(calculations.H)}
                x2={scaleX(calculations.v0x * calculations.tFlèche)}
                y2={scaleY(0)}
                stroke="#a78bfa"
                strokeWidth="1"
                strokeDasharray="4 4"
                opacity="0.5"
              />
              <circle
                cx={scaleX(calculations.v0x * calculations.tFlèche)}
                cy={scaleY(calculations.H)}
                r="5"
                fill="#a78bfa"
                opacity="0.7"
              />
              <text
                x={scaleX(calculations.v0x * calculations.tFlèche) + 10}
                y={scaleY(calculations.H) - 10}
                fill="#a78bfa"
                fontSize="11"
              >
                H = {calculations.H.toFixed(1)} m
              </text>
            </g>

            {/* Portée */}
            <g>
              <circle cx={scaleX(calculations.P)} cy={scaleY(0)} r="5" fill="#f97316" opacity="0.7" />
              <text x={scaleX(calculations.P)} y={scaleY(0) + 35} fill="#f97316" fontSize="11" textAnchor="middle">
                P = {calculations.P.toFixed(1)} m
              </text>
            </g>

            {/* Projectile actuel */}
            {currentPos.y >= 0 && (
              <g>
                <circle cx={projX} cy={projY} r="10" fill="#3b82f6" stroke="white" strokeWidth="2" />

                {/* Vecteur vitesse */}
                {showVectors && (
                  <line
                    x1={projX}
                    y1={projY}
                    x2={projX + currentVel.vx * vecScale}
                    y2={projY - currentVel.vy * vecScale}
                    stroke="#60a5fa"
                    strokeWidth="3"
                    markerEnd="url(#arrowVel)"
                  />
                )}

                {/* Décomposition vx et vy */}
                {showDecomposition && (
                  <>
                    {/* vx (horizontal) */}
                    <line
                      x1={projX}
                      y1={projY}
                      x2={projX + currentVel.vx * vecScale}
                      y2={projY}
                      stroke="#22c55e"
                      strokeWidth="2"
                      markerEnd="url(#arrowVx)"
                    />
                    <text x={projX + currentVel.vx * vecScale / 2} y={projY + 20} fill="#22c55e" fontSize="11" textAnchor="middle">
                      vₓ
                    </text>

                    {/* vy (vertical) */}
                    <line
                      x1={projX + currentVel.vx * vecScale}
                      y1={projY}
                      x2={projX + currentVel.vx * vecScale}
                      y2={projY - currentVel.vy * vecScale}
                      stroke="#f97316"
                      strokeWidth="2"
                      markerEnd="url(#arrowVy)"
                    />
                    <text x={projX + currentVel.vx * vecScale + 15} y={projY - currentVel.vy * vecScale / 2} fill="#f97316" fontSize="11">
                      vᵧ
                    </text>

                    {/* Accélération g (vers le bas) */}
                    <line
                      x1={projX}
                      y1={projY}
                      x2={projX}
                      y2={projY + 40}
                      stroke="#ef4444"
                      strokeWidth="2"
                      markerEnd="url(#arrowG)"
                    />
                    <text x={projX - 20} y={projY + 25} fill="#ef4444" fontSize="11">g⃗</text>
                  </>
                )}
              </g>
            )}

            {/* Légende */}
            <g transform="translate(30, 50)">
              <rect x={0} y={0} width={170} height={100} rx={8} fill="rgba(0,0,0,0.6)" />
              <line x1={15} y1={25} x2={50} y2={25} stroke="#60a5fa" strokeWidth="3" markerEnd="url(#arrowVel)" />
              <text x={60} y={30} fill="#60a5fa" fontSize="11">v⃗ (vitesse)</text>
              <line x1={15} y1={50} x2={50} y2={50} stroke="#22c55e" strokeWidth="2" />
              <text x={60} y={55} fill="#22c55e" fontSize="11">vₓ = v₀cos(α) = cte</text>
              <line x1={15} y1={75} x2={50} y2={75} stroke="#f97316" strokeWidth="2" />
              <text x={60} y={80} fill="#f97316" fontSize="11">vᵧ = v₀sin(α) - gt</text>
            </g>

            {/* Résultats */}
            <g transform={`translate(${svgWidth - 280}, 50)`}>
              <rect x={0} y={0} width={250} height={150} rx={8} fill="rgba(0,0,0,0.6)" stroke="rgba(255,255,255,0.1)" />
              <text x={15} y={25} fill="#e2e8f0" fontSize="13" fontWeight="600">Résultats</text>

              <text x={15} y={50} fill="#94a3b8" fontSize="11">Temps : t = {time.toFixed(2)} s / {calculations.tVol.toFixed(2)} s</text>

              <text x={15} y={75} fill="#22c55e" fontSize="12">
                vₓ = {calculations.v0x.toFixed(1)} m/s (constante)
              </text>
              <text x={15} y={95} fill="#f97316" fontSize="12">
                vᵧ = {currentVel.vy.toFixed(1)} m/s
              </text>
              <text x={15} y={115} fill="#60a5fa" fontSize="12">
                |v| = {currentVel.v.toFixed(1)} m/s
              </text>
              <text x={15} y={138} fill="#a78bfa" fontSize="12">
                Flèche H = {calculations.H.toFixed(1)} m | Portée P = {calculations.P.toFixed(1)} m
              </text>
            </g>

            {/* Angle initial */}
            <g transform={`translate(${scaleX(0)}, ${scaleY(y0)})`}>
              <path
                d={`M 30 0 A 30 30 0 0 0 ${30 * Math.cos(calculations.angleRad)} ${-30 * Math.sin(calculations.angleRad)}`}
                fill="none"
                stroke="#fbbf24"
                strokeWidth="2"
              />
              <text x={40} y={-15} fill="#fbbf24" fontSize="12">α = {angle}°</text>
            </g>
          </svg>
        </div>

        {/* Controls Panel */}
        <div className="p-4 pt-2 border-t border-slate-700/50 bg-slate-900/50">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Conditions initiales */}
            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Conditions initiales</h4>
              <Slider
                label="v₀ (vitesse initiale)"
                value={v0}
                min={5}
                max={40}
                step={1}
                unit="m/s"
                onChange={(v) => { setV0(v); setTime(0); }}
              />
              <Slider
                label="α (angle de tir)"
                value={angle}
                min={0}
                max={90}
                step={5}
                unit="°"
                onChange={(v) => { setAngle(v); setTime(0); }}
              />
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Hauteur</h4>
              <Slider
                label="y₀ (hauteur initiale)"
                value={y0}
                min={0}
                max={20}
                step={1}
                unit="m"
                onChange={(v) => { setY0(v); setTime(0); }}
              />
              <p className="text-xs text-slate-500">
                Portée max à α = 45° (si y₀ = 0)
              </p>
            </div>

            {/* Formules */}
            <div className="p-3 rounded-lg bg-slate-800/80 border border-slate-700">
              <h5 className="text-xs font-semibold text-slate-400 mb-2">ÉQUATIONS HORAIRES</h5>
              <div className="space-y-1 text-xs font-mono text-slate-300">
                <div>x(t) = v₀cos(α)·t</div>
                <div>y(t) = -½gt² + v₀sin(α)·t + y₀</div>
                <div className="text-purple-400 mt-2">H = v₀²sin²(α) / 2g</div>
                <div className="text-orange-400">P = v₀²sin(2α) / g</div>
              </div>
            </div>

            {/* Contrôles */}
            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Animation</h4>
              <button
                onClick={() => { setAnimating(!animating); if (!animating) setTime(0); }}
                className={`w-full px-4 py-2 rounded-lg font-medium transition-colors
                  ${animating ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'} text-white`}
              >
                {animating ? '⏸ Pause' : '▶ Lancer'}
              </button>
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm text-slate-300">
                  <input
                    type="checkbox"
                    checked={showVectors}
                    onChange={(e) => setShowVectors(e.target.checked)}
                    className="rounded border-slate-600 bg-slate-800"
                  />
                  Vecteur vitesse
                </label>
                <label className="flex items-center gap-2 text-sm text-slate-300">
                  <input
                    type="checkbox"
                    checked={showDecomposition}
                    onChange={(e) => setShowDecomposition(e.target.checked)}
                    className="rounded border-slate-600 bg-slate-800"
                  />
                  Décomposition vₓ, vᵧ
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-slate-700/50 flex items-center justify-between">
        <div className="text-sm text-slate-400">
          Mouvement plan : <span className="text-green-400">MRU horizontal</span> + <span className="text-orange-400">MRUV vertical</span>
        </div>
        <div className="text-xs text-slate-500">
          g = 9.81 m/s²
        </div>
      </div>
    </div>
  )
}
