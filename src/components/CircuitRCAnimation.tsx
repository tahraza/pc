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

export function CircuitRCAnimation() {
  // Paramètres du circuit
  const [R, setR] = useState(1000) // Ohms
  const [C, setC] = useState(100) // µF
  const [E, setE] = useState(10) // Volts
  const [mode, setMode] = useState<'charge' | 'decharge'>('charge')
  const [showTangent, setShowTangent] = useState(true)
  const [showCurrent, setShowCurrent] = useState(true)
  const [animating, setAnimating] = useState(false)

  // État de l'animation
  const [time, setTime] = useState(0)
  const animRef = useRef<number>()
  const lastTimeRef = useRef<number>(0)

  // Calculs physiques
  const tau = useMemo(() => {
    return (R * C * 1e-6) // τ = RC en secondes (C en µF → ×10⁻⁶)
  }, [R, C])

  // Tension et courant en fonction du temps
  const getValues = (t: number) => {
    if (mode === 'charge') {
      const uC = E * (1 - Math.exp(-t / tau))
      const i = (E / R) * Math.exp(-t / tau) * 1000 // en mA
      return { uC, i }
    } else {
      const uC = E * Math.exp(-t / tau)
      const i = -(E / R) * Math.exp(-t / tau) * 1000 // en mA (négatif)
      return { uC, i }
    }
  }

  const currentValues = getValues(time)

  // Animation
  useEffect(() => {
    if (animating) {
      lastTimeRef.current = performance.now()
      const animate = (currentTime: number) => {
        const dt = (currentTime - lastTimeRef.current) / 1000
        lastTimeRef.current = currentTime

        setTime(prev => {
          const newTime = prev + dt * 0.3 // Facteur de vitesse
          if (newTime > 5 * tau) {
            setAnimating(false)
            return 5 * tau
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
  }, [animating, tau])

  // Dimensions SVG pour le graphique
  const graphWidth = 600
  const graphHeight = 350
  const margin = { top: 30, right: 40, bottom: 50, left: 60 }

  const plotWidth = graphWidth - margin.left - margin.right
  const plotHeight = graphHeight - margin.top - margin.bottom

  // Échelles
  const maxTime = 5 * tau
  const scaleX = (t: number) => margin.left + (t / maxTime) * plotWidth
  const scaleY = (u: number) => margin.top + plotHeight - (u / E) * plotHeight

  // Générer les points de la courbe
  const generateCurve = () => {
    const points: string[] = []
    for (let t = 0; t <= maxTime; t += maxTime / 200) {
      const { uC } = getValues(t)
      points.push(`${scaleX(t)},${scaleY(uC)}`)
    }
    return points.join(' ')
  }

  // Générer la courbe du courant
  const generateCurrentCurve = () => {
    const points: string[] = []
    const maxI = (E / R) * 1000 // mA
    for (let t = 0; t <= maxTime; t += maxTime / 200) {
      const { i } = getValues(t)
      const normalizedI = mode === 'charge' ? i / maxI : -i / maxI
      points.push(`${scaleX(t)},${scaleY(normalizedI * E)}`)
    }
    return points.join(' ')
  }

  // Tangente à l'origine
  const tangentEndX = scaleX(tau)
  const tangentEndY = mode === 'charge' ? scaleY(E) : scaleY(0)

  return (
    <div className="my-8 rounded-xl overflow-hidden" style={{ background: 'linear-gradient(180deg, #0e1117 0%, #161b22 100%)' }}>
      {/* Header */}
      <div className="px-4 py-3 border-b border-slate-700/50">
        <h3 className="text-lg font-semibold text-slate-100">
          Circuit RC — Charge et décharge d'un condensateur
        </h3>
        <p className="text-sm text-slate-400 mt-1">
          Évolution exponentielle de la tension et du courant
        </p>
      </div>

      <div className="flex flex-col">
        <div className="p-4 pb-2 grid grid-cols-1 lg:grid-cols-[auto_1fr] gap-4">
          {/* Schéma du circuit */}
          <div className="flex flex-col items-center">
            <svg viewBox="0 0 280 220" className="w-64 h-48">
              {/* Générateur */}
              <circle cx="50" cy="110" r="20" fill="none" stroke="#fbbf24" strokeWidth="2" />
              <text x="50" y="114" fill="#fbbf24" fontSize="14" textAnchor="middle">E</text>
              <line x1="45" y1="100" x2="55" y2="100" stroke="#fbbf24" strokeWidth="2" />
              <line x1="50" y1="95" x2="50" y2="105" stroke="#fbbf24" strokeWidth="2" />
              <line x1="45" y1="120" x2="55" y2="120" stroke="#fbbf24" strokeWidth="2" />

              {/* Fils */}
              <line x1="50" y1="90" x2="50" y2="50" stroke="#64748b" strokeWidth="2" />
              <line x1="50" y1="50" x2="230" y2="50" stroke="#64748b" strokeWidth="2" />
              <line x1="50" y1="130" x2="50" y2="170" stroke="#64748b" strokeWidth="2" />
              <line x1="50" y1="170" x2="230" y2="170" stroke="#64748b" strokeWidth="2" />

              {/* Résistance R */}
              <rect x="110" y="40" width="50" height="20" fill="none" stroke="#ef4444" strokeWidth="2" />
              <text x="135" y="30" fill="#ef4444" fontSize="12" textAnchor="middle">R</text>

              {/* Condensateur C */}
              <line x1="220" y1="80" x2="240" y2="80" stroke="#3b82f6" strokeWidth="2" />
              <line x1="220" y1="95" x2="240" y2="95" stroke="#3b82f6" strokeWidth="2" />
              <line x1="230" y1="50" x2="230" y2="80" stroke="#64748b" strokeWidth="2" />
              <line x1="230" y1="95" x2="230" y2="170" stroke="#64748b" strokeWidth="2" />
              <text x="255" y="90" fill="#3b82f6" fontSize="12">C</text>

              {/* Flèches courant */}
              <path d="M 80 50 L 95 50 M 90 45 L 95 50 L 90 55" stroke="#22c55e" strokeWidth="2" fill="none" />
              <text x="87" y="40" fill="#22c55e" fontSize="11">i</text>

              {/* Tension uC */}
              <line x1="210" y1="80" x2="210" y2="95" stroke="#a78bfa" strokeWidth="1" strokeDasharray="3 2" />
              <path d="M 205 83 L 210 80 L 215 83" stroke="#a78bfa" strokeWidth="1.5" fill="none" />
              <text x="195" y="90" fill="#a78bfa" fontSize="11">uC</text>

              {/* Valeurs */}
              <text x="135" y="75" fill="#ef4444" fontSize="10" textAnchor="middle">{R} Ω</text>
              <text x="255" y="105" fill="#3b82f6" fontSize="10">{C} µF</text>
              <text x="50" y="150" fill="#fbbf24" fontSize="10" textAnchor="middle">{E} V</text>
            </svg>

            {/* Valeurs actuelles */}
            <div className="mt-2 p-3 rounded-lg bg-slate-800/80 w-full">
              <div className="text-center mb-2">
                <span className="text-xs text-slate-400">τ = RC = </span>
                <span className="text-sm font-mono text-yellow-400">{(tau * 1000).toFixed(1)} ms</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-center">
                <div>
                  <div className="text-xs text-slate-400">uC</div>
                  <div className="text-lg font-mono text-blue-400">{currentValues.uC.toFixed(2)} V</div>
                </div>
                <div>
                  <div className="text-xs text-slate-400">i</div>
                  <div className="text-lg font-mono text-green-400">{currentValues.i.toFixed(2)} mA</div>
                </div>
              </div>
            </div>
          </div>

          {/* Graphique */}
          <svg viewBox={`0 0 ${graphWidth} ${graphHeight}`} className="w-full h-auto">
            {/* Grille */}
            <g opacity="0.15">
              {[0, 1, 2, 3, 4, 5].map(i => (
                <line key={`v${i}`} x1={scaleX(i * tau)} y1={margin.top} x2={scaleX(i * tau)} y2={margin.top + plotHeight} stroke="white" strokeWidth="1" />
              ))}
              {[0, 0.25, 0.5, 0.75, 1].map(frac => (
                <line key={`h${frac}`} x1={margin.left} y1={scaleY(frac * E)} x2={margin.left + plotWidth} y2={scaleY(frac * E)} stroke="white" strokeWidth="1" />
              ))}
            </g>

            {/* Axes */}
            <line x1={margin.left} y1={margin.top + plotHeight} x2={margin.left + plotWidth + 20} y2={margin.top + plotHeight} stroke="#64748b" strokeWidth="2" />
            <line x1={margin.left} y1={margin.top + plotHeight} x2={margin.left} y2={margin.top - 10} stroke="#64748b" strokeWidth="2" />
            <text x={margin.left + plotWidth + 10} y={margin.top + plotHeight - 10} fill="#94a3b8" fontSize="12">t</text>
            <text x={margin.left + 10} y={margin.top} fill="#94a3b8" fontSize="12">u, i</text>

            {/* Graduations τ */}
            {[1, 2, 3, 4, 5].map(i => (
              <g key={`tau${i}`}>
                <line x1={scaleX(i * tau)} y1={margin.top + plotHeight} x2={scaleX(i * tau)} y2={margin.top + plotHeight + 8} stroke="#64748b" strokeWidth="1" />
                <text x={scaleX(i * tau)} y={margin.top + plotHeight + 22} fill="#fbbf24" fontSize="10" textAnchor="middle">{i}τ</text>
              </g>
            ))}

            {/* Asymptote E */}
            <line
              x1={margin.left}
              y1={mode === 'charge' ? scaleY(E) : scaleY(0)}
              x2={margin.left + plotWidth}
              y2={mode === 'charge' ? scaleY(E) : scaleY(0)}
              stroke="#fbbf24"
              strokeWidth="1"
              strokeDasharray="6 3"
              opacity="0.6"
            />
            <text x={margin.left - 25} y={scaleY(E) + 4} fill="#fbbf24" fontSize="11">E</text>

            {/* 63% E ou 37% E */}
            <line
              x1={margin.left}
              y1={scaleY(mode === 'charge' ? 0.63 * E : 0.37 * E)}
              x2={scaleX(tau)}
              y2={scaleY(mode === 'charge' ? 0.63 * E : 0.37 * E)}
              stroke="#a78bfa"
              strokeWidth="1"
              strokeDasharray="4 2"
              opacity="0.5"
            />
            <text x={margin.left - 35} y={scaleY(mode === 'charge' ? 0.63 * E : 0.37 * E) + 4} fill="#a78bfa" fontSize="10">
              {mode === 'charge' ? '0.63E' : '0.37E'}
            </text>

            {/* Courbe uC(t) */}
            <polyline
              points={generateCurve()}
              fill="none"
              stroke="#3b82f6"
              strokeWidth="3"
            />

            {/* Courbe i(t) */}
            {showCurrent && (
              <polyline
                points={generateCurrentCurve()}
                fill="none"
                stroke="#22c55e"
                strokeWidth="2"
                strokeDasharray="6 3"
              />
            )}

            {/* Tangente à l'origine */}
            {showTangent && (
              <>
                <line
                  x1={scaleX(0)}
                  y1={mode === 'charge' ? scaleY(0) : scaleY(E)}
                  x2={tangentEndX}
                  y2={tangentEndY}
                  stroke="#ef4444"
                  strokeWidth="2"
                  strokeDasharray="8 4"
                />
                {/* Point d'intersection avec l'asymptote */}
                <circle cx={scaleX(tau)} cy={tangentEndY} r="5" fill="#ef4444" />
                <line
                  x1={scaleX(tau)}
                  y1={tangentEndY}
                  x2={scaleX(tau)}
                  y2={margin.top + plotHeight}
                  stroke="#ef4444"
                  strokeWidth="1"
                  strokeDasharray="4 2"
                />
                <text x={scaleX(tau) + 5} y={tangentEndY - 10} fill="#ef4444" fontSize="11">
                  τ = {(tau * 1000).toFixed(1)} ms
                </text>
              </>
            )}

            {/* Point actuel */}
            <circle
              cx={scaleX(time)}
              cy={scaleY(currentValues.uC)}
              r="6"
              fill="#3b82f6"
              stroke="white"
              strokeWidth="2"
            />

            {/* Légende */}
            <g transform="translate(450, 40)">
              <rect x={0} y={0} width={130} height={70} rx={6} fill="rgba(0,0,0,0.5)" />
              <line x1={10} y1={20} x2={40} y2={20} stroke="#3b82f6" strokeWidth="3" />
              <text x={50} y={24} fill="#3b82f6" fontSize="11">uC(t)</text>
              <line x1={10} y1={40} x2={40} y2={40} stroke="#22c55e" strokeWidth="2" strokeDasharray="6 3" />
              <text x={50} y={44} fill="#22c55e" fontSize="11">i(t)</text>
              <line x1={10} y1={60} x2={40} y2={60} stroke="#ef4444" strokeWidth="2" strokeDasharray="8 4" />
              <text x={50} y={64} fill="#ef4444" fontSize="11">Tangente</text>
            </g>
          </svg>
        </div>

        {/* Controls Panel */}
        <div className="p-4 pt-2 border-t border-slate-700/50 bg-slate-900/50">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Paramètres du circuit */}
            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Circuit</h4>
              <Slider
                label="R (résistance)"
                value={R}
                min={100}
                max={10000}
                step={100}
                unit="Ω"
                onChange={(v) => { setR(v); setTime(0); }}
              />
              <Slider
                label="C (capacité)"
                value={C}
                min={10}
                max={1000}
                step={10}
                unit="µF"
                onChange={(v) => { setC(v); setTime(0); }}
              />
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Tension</h4>
              <Slider
                label="E (générateur)"
                value={E}
                min={1}
                max={20}
                step={1}
                unit="V"
                onChange={(v) => { setE(v); setTime(0); }}
              />
              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => { setMode('charge'); setTime(0); }}
                  className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors
                    ${mode === 'charge' ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}
                >
                  Charge
                </button>
                <button
                  onClick={() => { setMode('decharge'); setTime(0); }}
                  className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors
                    ${mode === 'decharge' ? 'bg-orange-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}
                >
                  Décharge
                </button>
              </div>
            </div>

            {/* Formules */}
            <div className="p-3 rounded-lg bg-slate-800/80 border border-slate-700">
              <h5 className="text-xs font-semibold text-slate-400 mb-2">FORMULES</h5>
              <div className="space-y-1 text-xs font-mono text-slate-300">
                <div className="text-yellow-400">τ = R × C</div>
                {mode === 'charge' ? (
                  <>
                    <div className="text-blue-400">uC = E(1 - e^(-t/τ))</div>
                    <div className="text-green-400">i = (E/R)e^(-t/τ)</div>
                  </>
                ) : (
                  <>
                    <div className="text-blue-400">uC = E × e^(-t/τ)</div>
                    <div className="text-green-400">i = -(E/R)e^(-t/τ)</div>
                  </>
                )}
                <div className="text-purple-400 mt-1">À t=τ : uC ≈ {mode === 'charge' ? '63%' : '37%'}E</div>
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
                {animating ? '⏸ Pause' : '▶ Démarrer'}
              </button>
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm text-slate-300">
                  <input
                    type="checkbox"
                    checked={showTangent}
                    onChange={(e) => setShowTangent(e.target.checked)}
                    className="rounded border-slate-600 bg-slate-800"
                  />
                  Tangente (méthode τ)
                </label>
                <label className="flex items-center gap-2 text-sm text-slate-300">
                  <input
                    type="checkbox"
                    checked={showCurrent}
                    onChange={(e) => setShowCurrent(e.target.checked)}
                    className="rounded border-slate-600 bg-slate-800"
                  />
                  Courbe i(t)
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-slate-700/50 flex items-center justify-between">
        <div className="text-sm text-slate-400">
          Mode : <span className={mode === 'charge' ? 'text-blue-400' : 'text-orange-400'}>
            {mode === 'charge' ? 'Charge du condensateur' : 'Décharge du condensateur'}
          </span>
        </div>
        <div className="text-xs text-slate-500">
          Temps : <span className="font-mono">{(time * 1000).toFixed(0)} ms</span> | τ = <span className="text-yellow-400 font-mono">{(tau * 1000).toFixed(1)} ms</span>
        </div>
      </div>
    </div>
  )
}
