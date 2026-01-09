'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

export function OndesMecaniquesAnimation() {
  // Paramètres de l'onde
  const [amplitude, setAmplitude] = useState(40)
  const [frequency, setFrequency] = useState(0.5)
  const [wavelength, setWavelength] = useState(150)
  const [isPlaying, setIsPlaying] = useState(true)
  const [showSecondWave, setShowSecondWave] = useState(false)
  const [phase2, setPhase2] = useState(0)

  // Animation
  const [time, setTime] = useState(0)
  const animationRef = useRef<number>()
  const lastTimeRef = useRef<number>(0)

  // Vitesse de propagation calculée
  const velocity = wavelength * frequency

  // Animation loop
  const animate = useCallback((timestamp: number) => {
    if (lastTimeRef.current === 0) {
      lastTimeRef.current = timestamp
    }
    const delta = (timestamp - lastTimeRef.current) / 1000
    lastTimeRef.current = timestamp

    if (isPlaying) {
      setTime(t => t + delta)
    }

    animationRef.current = requestAnimationFrame(animate)
  }, [isPlaying])

  useEffect(() => {
    animationRef.current = requestAnimationFrame(animate)
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [animate])

  // Fonction d'onde y(x, t) = A * sin(kx - ωt)
  const getY = (x: number, t: number, phaseOffset: number = 0): number => {
    const k = (2 * Math.PI) / wavelength
    const omega = 2 * Math.PI * frequency
    return amplitude * Math.sin(k * x - omega * t + phaseOffset)
  }

  // Génération des points de la courbe
  const generateWavePath = (phaseOffset: number = 0): string => {
    const points: string[] = []
    const startX = 50
    const endX = 750
    const baseY = 200

    for (let x = startX; x <= endX; x += 2) {
      const y = baseY - getY(x - startX, time, phaseOffset)
      if (x === startX) {
        points.push(`M ${x} ${y}`)
      } else {
        points.push(`L ${x} ${y}`)
      }
    }

    return points.join(' ')
  }

  // Onde résultante (superposition)
  const generateResultPath = (): string => {
    if (!showSecondWave) return ''

    const points: string[] = []
    const startX = 50
    const endX = 750
    const baseY = 200

    for (let x = startX; x <= endX; x += 2) {
      const y1 = getY(x - startX, time, 0)
      const y2 = getY(x - startX, time, phase2 * Math.PI)
      const y = baseY - (y1 + y2)
      if (x === startX) {
        points.push(`M ${x} ${y}`)
      } else {
        points.push(`L ${x} ${y}`)
      }
    }

    return points.join(' ')
  }

  // Position d'un point marqueur
  const markerX = 200
  const markerY1 = 200 - getY(markerX - 50, time, 0)
  const markerY2 = showSecondWave ? 200 - getY(markerX - 50, time, phase2 * Math.PI) : 0

  // Calcul de la période
  const period = 1 / frequency

  return (
    <div className="my-8 rounded-xl bg-slate-800 p-6">
      <h3 className="mb-4 text-xl font-semibold text-cyan-400">
        Ondes mécaniques progressives
      </h3>

      {/* Zone de visualisation */}
      <div className="mb-6 rounded-lg bg-slate-900 p-4">
        <svg viewBox="0 0 800 400" className="w-full">
          {/* Grille */}
          <defs>
            <pattern id="gridOndes" width="50" height="50" patternUnits="userSpaceOnUse">
              <path d="M 50 0 L 0 0 0 50" fill="none" stroke="#334155" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect x="50" y="50" width="700" height="300" fill="url(#gridOndes)" />

          {/* Axes */}
          <line x1="50" y1="200" x2="750" y2="200" stroke="#64748b" strokeWidth="1" strokeDasharray="5,5" />
          <line x1="50" y1="50" x2="50" y2="350" stroke="#64748b" strokeWidth="1" />

          {/* Labels */}
          <text x="760" y="205" fill="#94a3b8" fontSize="14">x</text>
          <text x="55" y="45" fill="#94a3b8" fontSize="14">y</text>
          <text x="45" y="205" fill="#94a3b8" fontSize="12" textAnchor="end">0</text>

          {/* Onde 1 */}
          <path
            d={generateWavePath(0)}
            fill="none"
            stroke="#22d3ee"
            strokeWidth="2.5"
          />

          {/* Onde 2 (si activée) */}
          {showSecondWave && (
            <path
              d={generateWavePath(phase2 * Math.PI)}
              fill="none"
              stroke="#f472b6"
              strokeWidth="2"
              strokeDasharray="8,4"
            />
          )}

          {/* Onde résultante */}
          {showSecondWave && (
            <path
              d={generateResultPath()}
              fill="none"
              stroke="#fbbf24"
              strokeWidth="2.5"
            />
          )}

          {/* Point marqueur onde 1 */}
          <circle cx={markerX} cy={markerY1} r="6" fill="#22d3ee" />

          {/* Point marqueur onde 2 */}
          {showSecondWave && (
            <circle cx={markerX} cy={markerY2} r="5" fill="#f472b6" />
          )}

          {/* Indication longueur d'onde */}
          <g transform="translate(50, 340)">
            <line x1="0" y1="0" x2={wavelength} y2="0" stroke="#a78bfa" strokeWidth="2" />
            <line x1="0" y1="-5" x2="0" y2="5" stroke="#a78bfa" strokeWidth="2" />
            <line x1={wavelength} y1="-5" x2={wavelength} y2="5" stroke="#a78bfa" strokeWidth="2" />
            <text x={wavelength / 2} y="20" fill="#a78bfa" fontSize="14" textAnchor="middle">λ = {wavelength} px</text>
          </g>

          {/* Indication amplitude */}
          <g transform="translate(30, 200)">
            <line x1="0" y1={-amplitude} x2="0" y2={amplitude} stroke="#34d399" strokeWidth="2" />
            <line x1="-5" y1={-amplitude} x2="5" y2={-amplitude} stroke="#34d399" strokeWidth="2" />
            <line x1="-5" y1={amplitude} x2="5" y2={amplitude} stroke="#34d399" strokeWidth="2" />
            <text x="-15" y="5" fill="#34d399" fontSize="12" textAnchor="end" transform="rotate(-90, -15, 0)">A = {amplitude} px</text>
          </g>

          {/* Direction de propagation */}
          <g transform="translate(600, 80)">
            <line x1="0" y1="0" x2="60" y2="0" stroke="#fb923c" strokeWidth="2" markerEnd="url(#arrowhead)" />
            <defs>
              <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                <polygon points="0 0, 10 3.5, 0 7" fill="#fb923c" />
              </marker>
            </defs>
            <text x="30" y="-10" fill="#fb923c" fontSize="12" textAnchor="middle">propagation</text>
          </g>

          {/* Légende */}
          <g transform="translate(550, 360)">
            <line x1="0" y1="0" x2="20" y2="0" stroke="#22d3ee" strokeWidth="2" />
            <text x="25" y="5" fill="#22d3ee" fontSize="11">Onde 1</text>
            {showSecondWave && (
              <>
                <line x1="70" y1="0" x2="90" y2="0" stroke="#f472b6" strokeWidth="2" strokeDasharray="4,2" />
                <text x="95" y="5" fill="#f472b6" fontSize="11">Onde 2</text>
                <line x1="140" y1="0" x2="160" y2="0" stroke="#fbbf24" strokeWidth="2" />
                <text x="165" y="5" fill="#fbbf24" fontSize="11">Somme</text>
              </>
            )}
          </g>
        </svg>
      </div>

      {/* Contrôles */}
      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* Amplitude */}
        <div className="rounded-lg bg-slate-700/50 p-4">
          <label className="mb-2 flex items-center justify-between text-sm text-slate-300">
            <span>Amplitude A</span>
            <span className="text-emerald-400">{amplitude} px</span>
          </label>
          <input
            type="range"
            min="10"
            max="80"
            value={amplitude}
            onChange={(e) => setAmplitude(Number(e.target.value))}
            className="w-full accent-emerald-500"
          />
        </div>

        {/* Fréquence */}
        <div className="rounded-lg bg-slate-700/50 p-4">
          <label className="mb-2 flex items-center justify-between text-sm text-slate-300">
            <span>Fréquence f</span>
            <span className="text-cyan-400">{frequency.toFixed(2)} Hz</span>
          </label>
          <input
            type="range"
            min="0.1"
            max="2"
            step="0.05"
            value={frequency}
            onChange={(e) => setFrequency(Number(e.target.value))}
            className="w-full accent-cyan-500"
          />
        </div>

        {/* Longueur d'onde */}
        <div className="rounded-lg bg-slate-700/50 p-4">
          <label className="mb-2 flex items-center justify-between text-sm text-slate-300">
            <span>Longueur d&apos;onde λ</span>
            <span className="text-purple-400">{wavelength} px</span>
          </label>
          <input
            type="range"
            min="50"
            max="300"
            step="10"
            value={wavelength}
            onChange={(e) => setWavelength(Number(e.target.value))}
            className="w-full accent-purple-500"
          />
        </div>

        {/* Deuxième onde */}
        <div className="rounded-lg bg-slate-700/50 p-4">
          <label className="mb-2 flex items-center gap-2 text-sm text-slate-300">
            <input
              type="checkbox"
              checked={showSecondWave}
              onChange={(e) => setShowSecondWave(e.target.checked)}
              className="rounded accent-pink-500"
            />
            <span>Afficher 2ème onde (superposition)</span>
          </label>
          {showSecondWave && (
            <div className="mt-2">
              <label className="mb-1 flex items-center justify-between text-xs text-slate-400">
                <span>Déphasage φ₂</span>
                <span className="text-pink-400">{phase2.toFixed(1)}π rad</span>
              </label>
              <input
                type="range"
                min="0"
                max="2"
                step="0.1"
                value={phase2}
                onChange={(e) => setPhase2(Number(e.target.value))}
                className="w-full accent-pink-500"
              />
            </div>
          )}
        </div>
      </div>

      {/* Boutons de contrôle */}
      <div className="mb-6 flex justify-center gap-4">
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className={`rounded-lg px-6 py-2 font-medium transition-colors ${
            isPlaying
              ? 'bg-amber-600 hover:bg-amber-700 text-white'
              : 'bg-emerald-600 hover:bg-emerald-700 text-white'
          }`}
        >
          {isPlaying ? '⏸ Pause' : '▶ Lecture'}
        </button>
        <button
          onClick={() => setTime(0)}
          className="rounded-lg bg-slate-600 px-6 py-2 font-medium text-white transition-colors hover:bg-slate-500"
        >
          ↺ Réinitialiser
        </button>
      </div>

      {/* Grandeurs calculées */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <div className="rounded-lg bg-slate-700/50 p-3 text-center">
          <div className="text-xs text-slate-400">Période T</div>
          <div className="text-lg font-bold text-cyan-400">{period.toFixed(2)} s</div>
          <div className="text-xs text-slate-500">T = 1/f</div>
        </div>
        <div className="rounded-lg bg-slate-700/50 p-3 text-center">
          <div className="text-xs text-slate-400">Célérité v</div>
          <div className="text-lg font-bold text-orange-400">{velocity.toFixed(1)} px/s</div>
          <div className="text-xs text-slate-500">v = λf</div>
        </div>
        <div className="rounded-lg bg-slate-700/50 p-3 text-center">
          <div className="text-xs text-slate-400">Nombre d&apos;onde k</div>
          <div className="text-lg font-bold text-purple-400">{(2 * Math.PI / wavelength).toFixed(3)} rad/px</div>
          <div className="text-xs text-slate-500">k = 2π/λ</div>
        </div>
        <div className="rounded-lg bg-slate-700/50 p-3 text-center">
          <div className="text-xs text-slate-400">Pulsation ω</div>
          <div className="text-lg font-bold text-emerald-400">{(2 * Math.PI * frequency).toFixed(2)} rad/s</div>
          <div className="text-xs text-slate-500">ω = 2πf</div>
        </div>
      </div>

      {/* Formules */}
      <div className="mt-6 rounded-lg bg-slate-900/50 p-4">
        <h4 className="mb-3 text-sm font-semibold text-slate-300">Équations de l&apos;onde progressive</h4>
        <div className="grid grid-cols-1 gap-3 text-sm md:grid-cols-2">
          <div className="rounded bg-slate-800 p-3">
            <div className="mb-1 text-slate-400">Équation horaire :</div>
            <div className="font-mono text-cyan-400">y(x,t) = A·sin(kx - ωt + φ)</div>
          </div>
          <div className="rounded bg-slate-800 p-3">
            <div className="mb-1 text-slate-400">Relation de dispersion :</div>
            <div className="font-mono text-orange-400">v = λ·f = ω/k</div>
          </div>
          {showSecondWave && (
            <div className="rounded bg-slate-800 p-3 md:col-span-2">
              <div className="mb-1 text-slate-400">Superposition (φ₂ = {phase2.toFixed(1)}π) :</div>
              <div className="font-mono text-yellow-400">
                {phase2 === 1 ? (
                  <span>Interférences destructives (opposition de phase)</span>
                ) : phase2 === 0 || phase2 === 2 ? (
                  <span>Interférences constructives (en phase)</span>
                ) : (
                  <span>y₁ + y₂ = A·sin(kx - ωt) + A·sin(kx - ωt + {phase2.toFixed(1)}π)</span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
