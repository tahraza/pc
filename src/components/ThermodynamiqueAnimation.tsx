'use client'

import { useState, useMemo } from 'react'
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

type TransformationType = 'isotherme' | 'isobare' | 'isochore' | 'adiabatique'

export function ThermodynamiqueAnimation() {
  const R = 8.314 // J/(mol·K)
  const gamma = 1.4 // Coefficient adiabatique (gaz diatomique)

  // État initial
  const [P1, setP1] = useState(1) // bar
  const [V1, setV1] = useState(1) // L
  const [n, setN] = useState(1) // mol

  // Type de transformation
  const [transformation, setTransformation] = useState<TransformationType>('isotherme')

  // État final (paramètre variable selon transformation)
  const [V2, setV2] = useState(2) // L (pour isotherme et adiabatique)
  const [P2, setP2] = useState(2) // bar (pour isochore)
  const [T2Factor, setT2Factor] = useState(1.5) // Facteur de température (pour isobare)

  // Calculs thermodynamiques
  const calculations = useMemo(() => {
    const P1Pa = P1 * 1e5 // Pa
    const V1m3 = V1 * 1e-3 // m³
    const T1 = (P1Pa * V1m3) / (n * R) // K

    let P2Pa: number, V2m3: number, T2: number, W: number, Q: number, deltaU: number

    switch (transformation) {
      case 'isotherme':
        // T = constante, PV = constante
        V2m3 = V2 * 1e-3
        P2Pa = (P1Pa * V1m3) / V2m3
        T2 = T1
        W = -n * R * T1 * Math.log(V2m3 / V1m3)
        deltaU = 0 // Gaz parfait isotherme
        Q = -W
        break

      case 'isobare':
        // P = constante
        P2Pa = P1Pa
        T2 = T1 * T2Factor
        V2m3 = (n * R * T2) / P2Pa
        W = -P1Pa * (V2m3 - V1m3)
        deltaU = n * (5/2) * R * (T2 - T1) // Cv = 5R/2 pour gaz diatomique
        Q = deltaU - W
        break

      case 'isochore':
        // V = constante
        V2m3 = V1m3
        P2Pa = P2 * 1e5
        T2 = (P2Pa * V2m3) / (n * R)
        W = 0 // Pas de travail à volume constant
        deltaU = n * (5/2) * R * (T2 - T1)
        Q = deltaU
        break

      case 'adiabatique':
        // Q = 0, PV^γ = constante
        V2m3 = V2 * 1e-3
        P2Pa = P1Pa * Math.pow(V1m3 / V2m3, gamma)
        T2 = (P2Pa * V2m3) / (n * R)
        Q = 0
        deltaU = n * (5/2) * R * (T2 - T1)
        W = -deltaU
        break
    }

    return {
      T1,
      T2,
      P2: P2Pa / 1e5,
      V2: V2m3 * 1e3,
      W: W / 1000, // kJ
      Q: Q / 1000, // kJ
      deltaU: deltaU / 1000, // kJ
    }
  }, [P1, V1, n, transformation, V2, P2, T2Factor])

  // Dimensions du graphique
  const graphWidth = 550
  const graphHeight = 400
  const margin = { top: 40, right: 40, bottom: 50, left: 60 }
  const plotWidth = graphWidth - margin.left - margin.right
  const plotHeight = graphHeight - margin.top - margin.bottom

  // Échelles
  const maxV = Math.max(V1, calculations.V2) * 1.3
  const maxP = Math.max(P1, calculations.P2) * 1.3
  const scaleX = (v: number) => margin.left + (v / maxV) * plotWidth
  const scaleY = (p: number) => margin.top + plotHeight - (p / maxP) * plotHeight

  // Générer les points de la courbe de transformation
  const generateTransformationCurve = useMemo(() => {
    const points: string[] = []
    const steps = 100

    const P1Pa = P1 * 1e5
    const V1m3 = V1 * 1e-3
    const T1 = (P1Pa * V1m3) / (n * R)
    const V2m3 = calculations.V2 * 1e-3

    for (let i = 0; i <= steps; i++) {
      let v: number, p: number
      const t = i / steps

      switch (transformation) {
        case 'isotherme':
          v = V1m3 + t * (V2m3 - V1m3)
          p = (n * R * T1) / v / 1e5
          break

        case 'isobare':
          v = V1m3 + t * (V2m3 - V1m3)
          p = P1
          break

        case 'isochore':
          v = V1
          p = P1 + t * (calculations.P2 - P1)
          break

        case 'adiabatique':
          v = V1m3 + t * (V2m3 - V1m3)
          p = P1Pa * Math.pow(V1m3 / v, gamma) / 1e5
          break
      }

      points.push(`${scaleX(transformation === 'isochore' ? v : v * 1e3)},${scaleY(p)}`)
    }
    return points.join(' ')
  }, [P1, V1, n, transformation, calculations, scaleX, scaleY])

  // Générer l'aire sous la courbe (travail)
  const generateWorkArea = useMemo(() => {
    if (transformation === 'isochore') return ''

    const points: string[] = []
    const steps = 100

    const P1Pa = P1 * 1e5
    const V1m3 = V1 * 1e-3
    const T1 = (P1Pa * V1m3) / (n * R)
    const V2m3 = calculations.V2 * 1e-3

    // Point de départ en bas
    points.push(`${scaleX(V1)},${scaleY(0)}`)

    for (let i = 0; i <= steps; i++) {
      let v: number, p: number
      const t = i / steps

      switch (transformation) {
        case 'isotherme':
          v = V1m3 + t * (V2m3 - V1m3)
          p = (n * R * T1) / v / 1e5
          break

        case 'isobare':
          v = V1m3 + t * (V2m3 - V1m3)
          p = P1
          break

        case 'adiabatique':
          v = V1m3 + t * (V2m3 - V1m3)
          p = P1Pa * Math.pow(V1m3 / v, gamma) / 1e5
          break

        default:
          v = V1m3
          p = P1
      }

      points.push(`${scaleX(v * 1e3)},${scaleY(p)}`)
    }

    // Fermer le polygone
    points.push(`${scaleX(calculations.V2)},${scaleY(0)}`)

    return points.join(' ')
  }, [P1, V1, n, transformation, calculations, scaleX, scaleY])

  const transformationColors: Record<TransformationType, string> = {
    isotherme: '#3b82f6',
    isobare: '#22c55e',
    isochore: '#f97316',
    adiabatique: '#a855f7',
  }

  const transformationLabels: Record<TransformationType, string> = {
    isotherme: 'Isotherme (T = cte)',
    isobare: 'Isobare (P = cte)',
    isochore: 'Isochore (V = cte)',
    adiabatique: 'Adiabatique (Q = 0)',
  }

  return (
    <div className="my-8 rounded-xl overflow-hidden" style={{ background: 'linear-gradient(180deg, #0e1117 0%, #161b22 100%)' }}>
      {/* Header */}
      <div className="px-4 py-3 border-b border-slate-700/50">
        <h3 className="text-lg font-semibold text-slate-100">
          Thermodynamique — Diagramme P-V
        </h3>
        <p className="text-sm text-slate-400 mt-1">
          Transformations thermodynamiques et travail des forces de pression
        </p>
      </div>

      <div className="flex flex-col">
        <div className="p-4 pb-2 grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-4">
          {/* Graphique P-V */}
          <svg viewBox={`0 0 ${graphWidth} ${graphHeight}`} className="w-full h-auto">
            {/* Grille */}
            <g opacity="0.1">
              {Array.from({ length: 11 }).map((_, i) => (
                <line key={`v${i}`} x1={margin.left + (i / 10) * plotWidth} y1={margin.top} x2={margin.left + (i / 10) * plotWidth} y2={margin.top + plotHeight} stroke="white" />
              ))}
              {Array.from({ length: 11 }).map((_, i) => (
                <line key={`h${i}`} x1={margin.left} y1={margin.top + (i / 10) * plotHeight} x2={margin.left + plotWidth} y2={margin.top + (i / 10) * plotHeight} stroke="white" />
              ))}
            </g>

            {/* Axes */}
            <line x1={margin.left} y1={margin.top + plotHeight} x2={margin.left + plotWidth + 20} y2={margin.top + plotHeight} stroke="#64748b" strokeWidth="2" />
            <line x1={margin.left} y1={margin.top + plotHeight} x2={margin.left} y2={margin.top - 10} stroke="#64748b" strokeWidth="2" />
            <text x={margin.left + plotWidth / 2} y={graphHeight - 10} fill="#94a3b8" fontSize="14" textAnchor="middle">V (L)</text>
            <text x={20} y={margin.top + plotHeight / 2} fill="#94a3b8" fontSize="14" textAnchor="middle" transform={`rotate(-90, 20, ${margin.top + plotHeight / 2})`}>P (bar)</text>

            {/* Graduations */}
            {[0, 0.5, 1].map(frac => {
              const v = frac * maxV
              return (
                <g key={`gv${frac}`}>
                  <text x={scaleX(v)} y={margin.top + plotHeight + 20} fill="#64748b" fontSize="10" textAnchor="middle">
                    {v.toFixed(1)}
                  </text>
                </g>
              )
            })}
            {[0, 0.5, 1].map(frac => {
              const p = frac * maxP
              return (
                <g key={`gp${frac}`}>
                  <text x={margin.left - 10} y={scaleY(p) + 4} fill="#64748b" fontSize="10" textAnchor="end">
                    {p.toFixed(1)}
                  </text>
                </g>
              )
            })}

            {/* Aire sous la courbe (travail) */}
            {transformation !== 'isochore' && (
              <polygon
                points={generateWorkArea}
                fill={transformationColors[transformation]}
                opacity="0.2"
              />
            )}

            {/* Courbe de transformation */}
            <polyline
              points={generateTransformationCurve}
              fill="none"
              stroke={transformationColors[transformation]}
              strokeWidth="3"
            />

            {/* Point initial */}
            <circle cx={scaleX(V1)} cy={scaleY(P1)} r="8" fill="#ef4444" stroke="white" strokeWidth="2" />
            <text x={scaleX(V1) - 15} y={scaleY(P1) - 15} fill="#ef4444" fontSize="12" fontWeight="bold">A</text>

            {/* Point final */}
            <circle cx={scaleX(calculations.V2)} cy={scaleY(calculations.P2)} r="8" fill="#22c55e" stroke="white" strokeWidth="2" />
            <text x={scaleX(calculations.V2) + 10} y={scaleY(calculations.P2) - 10} fill="#22c55e" fontSize="12" fontWeight="bold">B</text>

            {/* Flèche de direction */}
            <defs>
              <marker id="arrowTransf" markerWidth="10" markerHeight="10" refX="5" refY="5" orient="auto">
                <path d="M0,0 L10,5 L0,10 Z" fill={transformationColors[transformation]} />
              </marker>
            </defs>

            {/* Légende */}
            <g transform={`translate(${margin.left + 10}, ${margin.top + 10})`}>
              <rect x={0} y={0} width={180} height={90} rx={6} fill="rgba(0,0,0,0.6)" />
              <text x={10} y={20} fill="#e2e8f0" fontSize="12" fontWeight="600">
                {transformationLabels[transformation]}
              </text>
              <text x={10} y={40} fill="#ef4444" fontSize="11">A: P={P1.toFixed(2)} bar, V={V1.toFixed(2)} L</text>
              <text x={10} y={55} fill="#22c55e" fontSize="11">B: P={calculations.P2.toFixed(2)} bar, V={calculations.V2.toFixed(2)} L</text>
              <text x={10} y={75} fill="#fbbf24" fontSize="11">
                W = {calculations.W > 0 ? '+' : ''}{calculations.W.toFixed(2)} kJ (aire)
              </text>
            </g>
          </svg>

          {/* Bilan énergétique */}
          <div className="space-y-3 min-w-[220px]">
            <div className="p-3 rounded-lg bg-slate-800/80 border border-slate-700">
              <h5 className="text-xs font-semibold text-slate-400 mb-3">BILAN ÉNERGÉTIQUE</h5>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-400 text-sm">T₁ :</span>
                  <span className="font-mono text-blue-400">{calculations.T1.toFixed(0)} K</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 text-sm">T₂ :</span>
                  <span className="font-mono text-green-400">{calculations.T2.toFixed(0)} K</span>
                </div>
                <hr className="border-slate-700" />
                <div className="flex justify-between">
                  <span className="text-slate-400 text-sm">W (travail) :</span>
                  <span className={`font-mono ${calculations.W >= 0 ? 'text-red-400' : 'text-green-400'}`}>
                    {calculations.W >= 0 ? '+' : ''}{calculations.W.toFixed(2)} kJ
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 text-sm">Q (chaleur) :</span>
                  <span className={`font-mono ${calculations.Q >= 0 ? 'text-orange-400' : 'text-blue-400'}`}>
                    {calculations.Q >= 0 ? '+' : ''}{calculations.Q.toFixed(2)} kJ
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 text-sm">ΔU :</span>
                  <span className={`font-mono ${calculations.deltaU >= 0 ? 'text-purple-400' : 'text-cyan-400'}`}>
                    {calculations.deltaU >= 0 ? '+' : ''}{calculations.deltaU.toFixed(2)} kJ
                  </span>
                </div>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-yellow-900/30 border border-yellow-800/50">
              <h5 className="text-xs font-semibold text-yellow-300 mb-2">1er PRINCIPE</h5>
              <div className="text-center font-mono text-yellow-200">
                ΔU = W + Q
              </div>
              <div className="text-center text-xs text-yellow-400 mt-1">
                {calculations.deltaU.toFixed(2)} = {calculations.W.toFixed(2)} + {calculations.Q.toFixed(2)}
              </div>
            </div>
          </div>
        </div>

        {/* Controls Panel */}
        <div className="p-4 pt-2 border-t border-slate-700/50 bg-slate-900/50">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* État initial */}
            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wide">État initial (A)</h4>
              <Slider label="P₁ (pression)" value={P1} min={0.5} max={5} step={0.1} unit="bar" onChange={setP1} />
              <Slider label="V₁ (volume)" value={V1} min={0.5} max={3} step={0.1} unit="L" onChange={setV1} />
            </div>

            {/* Type de transformation */}
            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Transformation</h4>
              <div className="grid grid-cols-2 gap-2">
                {(['isotherme', 'isobare', 'isochore', 'adiabatique'] as TransformationType[]).map(t => (
                  <button
                    key={t}
                    onClick={() => setTransformation(t)}
                    className={`px-2 py-1.5 rounded text-xs font-medium transition-colors
                      ${transformation === t ? 'text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}
                    style={{ backgroundColor: transformation === t ? transformationColors[t] : undefined }}
                  >
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Paramètre final */}
            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wide">État final (B)</h4>
              {transformation === 'isotherme' || transformation === 'adiabatique' ? (
                <Slider label="V₂ (volume)" value={V2} min={0.5} max={4} step={0.1} unit="L" onChange={setV2} />
              ) : transformation === 'isobare' ? (
                <Slider label="T₂/T₁" value={T2Factor} min={0.5} max={3} step={0.1} unit="×" onChange={setT2Factor} />
              ) : (
                <Slider label="P₂ (pression)" value={P2} min={0.5} max={5} step={0.1} unit="bar" onChange={setP2} />
              )}
            </div>

            {/* Formules */}
            <div className="p-3 rounded-lg bg-slate-800/80 border border-slate-700">
              <h5 className="text-xs font-semibold text-slate-400 mb-2">CARACTÉRISTIQUES</h5>
              <div className="space-y-2 text-xs text-slate-300">
                {transformation === 'isotherme' && (
                  <>
                    <div className="text-blue-400"><MathInline>{String.raw`PV = nRT = \text{cte}`}</MathInline></div>
                    <div><MathInline>{String.raw`W = -nRT\ln\left(\frac{V_2}{V_1}\right)`}</MathInline></div>
                    <div><MathInline>{String.raw`\Delta U = 0`}</MathInline> (gaz parfait)</div>
                  </>
                )}
                {transformation === 'isobare' && (
                  <>
                    <div className="text-green-400"><MathInline>{String.raw`P = \text{cte}`}</MathInline></div>
                    <div><MathInline>{String.raw`W = -P\Delta V`}</MathInline></div>
                    <div><MathInline>{String.raw`Q = nC_p\Delta T`}</MathInline></div>
                  </>
                )}
                {transformation === 'isochore' && (
                  <>
                    <div className="text-orange-400"><MathInline>{String.raw`V = \text{cte}`}</MathInline></div>
                    <div><MathInline>{String.raw`W = 0`}</MathInline></div>
                    <div><MathInline>{String.raw`Q = \Delta U = nC_v\Delta T`}</MathInline></div>
                  </>
                )}
                {transformation === 'adiabatique' && (
                  <>
                    <div className="text-purple-400"><MathInline>{String.raw`Q = 0`}</MathInline></div>
                    <div><MathInline>{String.raw`PV^\gamma = \text{cte}`}</MathInline></div>
                    <div><MathInline>{String.raw`W = \Delta U`}</MathInline></div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-slate-700/50 flex items-center justify-between">
        <div className="text-sm text-slate-400">
          Transformation : <span style={{ color: transformationColors[transformation] }}>{transformationLabels[transformation]}</span>
        </div>
        <div className="text-xs text-slate-500">
          n = {n} mol | γ = {gamma}
        </div>
      </div>
    </div>
  )
}
