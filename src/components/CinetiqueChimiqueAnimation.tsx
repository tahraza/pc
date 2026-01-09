'use client'

import { useState, useEffect, useRef, useCallback, useMemo } from 'react'

export function CinetiqueChimiqueAnimation() {
  // Paramètres de la réaction
  const [order, setOrder] = useState<0 | 1 | 2>(1)
  const [k, setK] = useState(0.5) // Constante de vitesse
  const [c0, setC0] = useState(1.0) // Concentration initiale
  const [isPlaying, setIsPlaying] = useState(true)

  // Animation
  const [time, setTime] = useState(0)
  const animationRef = useRef<number>()
  const lastTimeRef = useRef<number>(0)

  // Animation loop
  const animate = useCallback((timestamp: number) => {
    if (lastTimeRef.current === 0) {
      lastTimeRef.current = timestamp
    }
    const delta = (timestamp - lastTimeRef.current) / 1000
    lastTimeRef.current = timestamp

    if (isPlaying) {
      setTime(t => Math.min(t + delta * 0.5, 10))
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

  // Calcul de la concentration selon l'ordre
  const getConcentration = useCallback((t: number): number => {
    switch (order) {
      case 0:
        return Math.max(0, c0 - k * t)
      case 1:
        return c0 * Math.exp(-k * t)
      case 2:
        return c0 / (1 + k * c0 * t)
      default:
        return c0
    }
  }, [order, k, c0])

  // Calcul de la vitesse de réaction
  const getVelocity = useCallback((t: number): number => {
    const c = getConcentration(t)
    switch (order) {
      case 0:
        return c > 0 ? k : 0
      case 1:
        return k * c
      case 2:
        return k * c * c
      default:
        return 0
    }
  }, [order, k, getConcentration])

  // Temps de demi-réaction
  const halfLife = useMemo(() => {
    switch (order) {
      case 0:
        return c0 / (2 * k)
      case 1:
        return Math.log(2) / k
      case 2:
        return 1 / (k * c0)
      default:
        return 0
    }
  }, [order, k, c0])

  // Concentration actuelle
  const currentC = getConcentration(time)
  const currentV = getVelocity(time)

  // Génération de la courbe C(t)
  const generateConcentrationPath = useMemo(() => {
    const points: string[] = []
    const startX = 80
    const endX = 580
    const maxT = 10
    const baseY = 300
    const height = 220

    for (let x = startX; x <= endX; x += 3) {
      const t = ((x - startX) / (endX - startX)) * maxT
      const c = getConcentration(t)
      const y = baseY - (c / c0) * height

      if (x === startX) {
        points.push(`M ${x} ${y}`)
      } else {
        points.push(`L ${x} ${y}`)
      }
    }

    return points.join(' ')
  }, [getConcentration, c0])

  // Position du marqueur
  const markerX = 80 + (time / 10) * 500
  const markerY = 300 - (currentC / c0) * 220

  // Coordonnées pour la représentation ln(C) ou 1/C
  const generateLinearPath = useMemo(() => {
    const points: string[] = []
    const startX = 80
    const endX = 580
    const maxT = 10

    for (let x = startX; x <= endX; x += 3) {
      const t = ((x - startX) / (endX - startX)) * maxT
      const c = getConcentration(t)

      let y: number
      if (order === 1) {
        // ln(C) = ln(C0) - kt
        const lnC = c > 0.001 ? Math.log(c) : Math.log(0.001)
        y = 200 - (lnC + 2) * 50 // Échelle ajustée
      } else if (order === 2) {
        // 1/C = 1/C0 + kt
        const invC = 1 / Math.max(c, 0.01)
        y = 320 - invC * 25 // Échelle ajustée
      } else {
        // Ordre 0: C linéaire
        y = 300 - (c / c0) * 220
      }

      if (x === startX) {
        points.push(`M ${x} ${y}`)
      } else {
        points.push(`L ${x} ${y}`)
      }
    }

    return points.join(' ')
  }, [order, getConcentration, c0])

  return (
    <div className="my-8 rounded-xl bg-slate-800 p-6">
      <h3 className="mb-4 text-xl font-semibold text-cyan-400">
        Cinétique chimique - Évolution temporelle
      </h3>

      {/* Zone de visualisation */}
      <div className="mb-6 rounded-lg bg-slate-900 p-4">
        <svg viewBox="0 0 700 380" className="w-full">
          {/* Grille */}
          <defs>
            <pattern id="gridCinetique" width="50" height="50" patternUnits="userSpaceOnUse">
              <path d="M 50 0 L 0 0 0 50" fill="none" stroke="#334155" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect x="80" y="50" width="520" height="280" fill="url(#gridCinetique)" />

          {/* Axes */}
          <line x1="80" y1="330" x2="600" y2="330" stroke="#64748b" strokeWidth="1.5" />
          <line x1="80" y1="50" x2="80" y2="330" stroke="#64748b" strokeWidth="1.5" />

          {/* Graduation Y */}
          {[0, 0.25, 0.5, 0.75, 1].map((val, i) => (
            <g key={i}>
              <line x1="75" y1={330 - val * 280} x2="80" y2={330 - val * 280} stroke="#64748b" strokeWidth="1" />
              <text x="70" y={335 - val * 280} fill="#94a3b8" fontSize="11" textAnchor="end">
                {(val * c0).toFixed(2)}
              </text>
            </g>
          ))}

          {/* Graduation X */}
          {[0, 2, 4, 6, 8, 10].map((val, i) => (
            <g key={i}>
              <line x1={80 + val * 52} y1="330" x2={80 + val * 52} y2="335" stroke="#64748b" strokeWidth="1" />
              <text x={80 + val * 52} y="350" fill="#94a3b8" fontSize="11" textAnchor="middle">{val}</text>
            </g>
          ))}

          {/* Labels axes */}
          <text x="620" y="335" fill="#94a3b8" fontSize="13">t (s)</text>
          <text x="60" y="40" fill="#94a3b8" fontSize="13">[A] (mol/L)</text>

          {/* Ligne C0 */}
          <line x1="80" y1={330 - 280} x2="600" y2={330 - 280} stroke="#64748b" strokeWidth="1" strokeDasharray="5,5" />
          <text x="610" y={330 - 275} fill="#64748b" fontSize="10">[A]₀</text>

          {/* Ligne t1/2 */}
          {halfLife <= 10 && (
            <g>
              <line x1={80 + halfLife * 52} y1="50" x2={80 + halfLife * 52} y2="330" stroke="#a78bfa" strokeWidth="1" strokeDasharray="5,5" />
              <text x={85 + halfLife * 52} y="60" fill="#a78bfa" fontSize="10">t½</text>
              {/* Ligne horizontale à C0/2 */}
              <line x1="80" y1={330 - 140} x2={80 + halfLife * 52} y2={330 - 140} stroke="#a78bfa" strokeWidth="1" strokeDasharray="3,3" />
            </g>
          )}

          {/* Courbe C(t) */}
          <path
            d={generateConcentrationPath}
            fill="none"
            stroke="#22d3ee"
            strokeWidth="2.5"
          />

          {/* Marqueur position actuelle */}
          <circle cx={markerX} cy={markerY} r="7" fill="#22d3ee" />
          <line x1={markerX} y1={markerY} x2={markerX} y2="330" stroke="#22d3ee" strokeWidth="1" strokeDasharray="3,3" />

          {/* Affichage valeur actuelle */}
          <g transform={`translate(${Math.min(markerX + 10, 520)}, ${Math.max(markerY - 20, 70)})`}>
            <rect x="-5" y="-15" width="85" height="40" fill="#1e293b" rx="4" />
            <text x="0" y="0" fill="#22d3ee" fontSize="11">t = {time.toFixed(2)} s</text>
            <text x="0" y="15" fill="#22d3ee" fontSize="11">[A] = {currentC.toFixed(3)}</text>
          </g>

          {/* Représentation des molécules */}
          <g transform="translate(620, 100)">
            <rect x="0" y="0" width="70" height="180" fill="#1e293b" rx="8" stroke="#334155" strokeWidth="1" />
            <text x="35" y="20" fill="#94a3b8" fontSize="10" textAnchor="middle">Réacteur</text>
            {/* Molécules A (cyan) */}
            {Array.from({ length: Math.round(currentC / c0 * 20) }).map((_, i) => (
              <circle
                key={`a-${i}`}
                cx={15 + (i % 4) * 15}
                cy={40 + Math.floor(i / 4) * 20}
                r="5"
                fill="#22d3ee"
              />
            ))}
            {/* Molécules B (produit, orange) */}
            {Array.from({ length: Math.round((1 - currentC / c0) * 20) }).map((_, i) => (
              <circle
                key={`b-${i}`}
                cx={15 + (i % 4) * 15}
                cy={150 - Math.floor(i / 4) * 15}
                r="4"
                fill="#fb923c"
              />
            ))}
          </g>

          {/* Légende */}
          <g transform="translate(450, 50)">
            <circle cx="0" cy="0" r="5" fill="#22d3ee" />
            <text x="10" y="4" fill="#22d3ee" fontSize="11">Réactif A</text>
            <circle cx="0" cy="20" r="4" fill="#fb923c" />
            <text x="10" y="24" fill="#fb923c" fontSize="11">Produit B</text>
          </g>
        </svg>
      </div>

      {/* Contrôles */}
      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        {/* Ordre de réaction */}
        <div className="rounded-lg bg-slate-700/50 p-4">
          <label className="mb-2 block text-sm text-slate-300">Ordre de réaction</label>
          <div className="flex gap-2">
            {[0, 1, 2].map((o) => (
              <button
                key={o}
                onClick={() => { setOrder(o as 0 | 1 | 2); setTime(0) }}
                className={`flex-1 rounded py-2 font-medium transition-colors ${
                  order === o
                    ? 'bg-cyan-600 text-white'
                    : 'bg-slate-600 text-slate-300 hover:bg-slate-500'
                }`}
              >
                n = {o}
              </button>
            ))}
          </div>
        </div>

        {/* Constante de vitesse */}
        <div className="rounded-lg bg-slate-700/50 p-4">
          <label className="mb-2 flex items-center justify-between text-sm text-slate-300">
            <span>Constante k</span>
            <span className="text-emerald-400">{k.toFixed(2)} {order === 0 ? 'mol·L⁻¹·s⁻¹' : order === 1 ? 's⁻¹' : 'L·mol⁻¹·s⁻¹'}</span>
          </label>
          <input
            type="range"
            min="0.1"
            max="2"
            step="0.1"
            value={k}
            onChange={(e) => { setK(Number(e.target.value)); setTime(0) }}
            className="w-full accent-emerald-500"
          />
        </div>

        {/* Concentration initiale */}
        <div className="rounded-lg bg-slate-700/50 p-4">
          <label className="mb-2 flex items-center justify-between text-sm text-slate-300">
            <span>[A]₀</span>
            <span className="text-orange-400">{c0.toFixed(2)} mol/L</span>
          </label>
          <input
            type="range"
            min="0.5"
            max="2"
            step="0.1"
            value={c0}
            onChange={(e) => { setC0(Number(e.target.value)); setTime(0) }}
            className="w-full accent-orange-500"
          />
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
          <div className="text-xs text-slate-400">[A] actuel</div>
          <div className="text-lg font-bold text-cyan-400">{currentC.toFixed(3)} mol/L</div>
        </div>
        <div className="rounded-lg bg-slate-700/50 p-3 text-center">
          <div className="text-xs text-slate-400">Vitesse v</div>
          <div className="text-lg font-bold text-emerald-400">{currentV.toFixed(4)} mol·L⁻¹·s⁻¹</div>
        </div>
        <div className="rounded-lg bg-slate-700/50 p-3 text-center">
          <div className="text-xs text-slate-400">Temps de demi-réaction t½</div>
          <div className="text-lg font-bold text-purple-400">{halfLife.toFixed(2)} s</div>
        </div>
        <div className="rounded-lg bg-slate-700/50 p-3 text-center">
          <div className="text-xs text-slate-400">Avancement</div>
          <div className="text-lg font-bold text-orange-400">{((1 - currentC / c0) * 100).toFixed(1)}%</div>
        </div>
      </div>

      {/* Formules */}
      <div className="mt-6 rounded-lg bg-slate-900/50 p-4">
        <h4 className="mb-3 text-sm font-semibold text-slate-300">Lois de vitesse - Ordre {order}</h4>
        <div className="grid grid-cols-1 gap-3 text-sm md:grid-cols-2">
          <div className="rounded bg-slate-800 p-3">
            <div className="mb-1 text-slate-400">Loi de vitesse :</div>
            <div className="font-mono text-cyan-400">
              {order === 0 && 'v = k'}
              {order === 1 && 'v = k·[A]'}
              {order === 2 && 'v = k·[A]²'}
            </div>
          </div>
          <div className="rounded bg-slate-800 p-3">
            <div className="mb-1 text-slate-400">Loi intégrée [A](t) :</div>
            <div className="font-mono text-emerald-400">
              {order === 0 && '[A] = [A]₀ - k·t'}
              {order === 1 && '[A] = [A]₀·e^(-kt)'}
              {order === 2 && '1/[A] = 1/[A]₀ + k·t'}
            </div>
          </div>
          <div className="rounded bg-slate-800 p-3">
            <div className="mb-1 text-slate-400">Temps de demi-réaction :</div>
            <div className="font-mono text-purple-400">
              {order === 0 && 't½ = [A]₀ / (2k)'}
              {order === 1 && 't½ = ln(2) / k'}
              {order === 2 && 't½ = 1 / (k·[A]₀)'}
            </div>
          </div>
          <div className="rounded bg-slate-800 p-3">
            <div className="mb-1 text-slate-400">Représentation linéaire :</div>
            <div className="font-mono text-orange-400">
              {order === 0 && '[A] = f(t) → droite'}
              {order === 1 && 'ln([A]) = f(t) → droite'}
              {order === 2 && '1/[A] = f(t) → droite'}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
