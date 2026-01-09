'use client'

import { useState, useEffect, useRef, useCallback, useMemo } from 'react'

export function EnergieMecaniqueAnimation() {
  // Paramètres du pendule
  const [length, setLength] = useState(200) // longueur en pixels
  const [mass, setMass] = useState(1.0) // masse en kg
  const [initialAngle, setInitialAngle] = useState(45) // angle initial en degrés
  const [friction, setFriction] = useState(0) // coefficient de frottement

  // État de l'animation
  const [isPlaying, setIsPlaying] = useState(true)
  const [angle, setAngle] = useState(initialAngle * Math.PI / 180)
  const [angularVelocity, setAngularVelocity] = useState(0)

  // Animation
  const animationRef = useRef<number>()
  const lastTimeRef = useRef<number>(0)

  // Constantes physiques
  const g = 9.81 // m/s²
  const pixelToMeter = 0.01 // 1 pixel = 1 cm

  // Calcul des énergies
  const energies = useMemo(() => {
    const L = length * pixelToMeter // longueur en mètres
    const h = L * (1 - Math.cos(angle)) // hauteur en mètres
    const v = angularVelocity * L // vitesse linéaire

    const Ep = mass * g * h // Énergie potentielle
    const Ec = 0.5 * mass * v * v // Énergie cinétique
    const Em = Ep + Ec // Énergie mécanique

    return { Ep, Ec, Em, h, v }
  }, [angle, angularVelocity, length, mass])

  // Énergie mécanique initiale (pour référence)
  const initialEm = useMemo(() => {
    const L = length * pixelToMeter
    const h0 = L * (1 - Math.cos(initialAngle * Math.PI / 180))
    return mass * g * h0
  }, [length, mass, initialAngle])

  // Simulation du pendule
  const animate = useCallback((timestamp: number) => {
    if (lastTimeRef.current === 0) {
      lastTimeRef.current = timestamp
    }
    const dt = Math.min((timestamp - lastTimeRef.current) / 1000, 0.05)
    lastTimeRef.current = timestamp

    if (isPlaying) {
      const L = length * pixelToMeter

      // Équation du mouvement: θ'' = -(g/L)sin(θ) - friction*θ'
      const angularAcceleration = -(g / L) * Math.sin(angle) - friction * angularVelocity

      // Méthode d'Euler semi-implicite
      const newAngularVelocity = angularVelocity + angularAcceleration * dt
      const newAngle = angle + newAngularVelocity * dt

      setAngularVelocity(newAngularVelocity)
      setAngle(newAngle)
    }

    animationRef.current = requestAnimationFrame(animate)
  }, [isPlaying, angle, angularVelocity, length, friction])

  useEffect(() => {
    animationRef.current = requestAnimationFrame(animate)
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [animate])

  // Reset
  const reset = () => {
    setAngle(initialAngle * Math.PI / 180)
    setAngularVelocity(0)
    lastTimeRef.current = 0
  }

  // Position du pendule
  const pivotX = 250
  const pivotY = 50
  const bobX = pivotX + length * Math.sin(angle)
  const bobY = pivotY + length * Math.cos(angle)

  // Historique pour le graphe d'énergie
  const [energyHistory, setEnergyHistory] = useState<Array<{ Ep: number; Ec: number; Em: number }>>([])

  useEffect(() => {
    if (isPlaying) {
      setEnergyHistory(prev => {
        const newHistory = [...prev, { Ep: energies.Ep, Ec: energies.Ec, Em: energies.Em }]
        return newHistory.slice(-100) // Garder les 100 derniers points
      })
    }
  }, [energies, isPlaying])

  // Période théorique (petites oscillations)
  const period = useMemo(() => {
    const L = length * pixelToMeter
    return 2 * Math.PI * Math.sqrt(L / g)
  }, [length])

  // Barres d'énergie
  const maxEnergy = initialEm * 1.1
  const barScale = 150 / maxEnergy

  return (
    <div className="my-8 rounded-xl bg-slate-800 p-6">
      <h3 className="mb-4 text-xl font-semibold text-cyan-400">
        Conservation de l&apos;énergie mécanique - Pendule simple
      </h3>

      {/* Zone de visualisation */}
      <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Pendule */}
        <div className="rounded-lg bg-slate-900 p-4">
          <svg viewBox="0 0 500 350" className="w-full">
            {/* Support */}
            <line x1="150" y1="50" x2="350" y2="50" stroke="#64748b" strokeWidth="4" />
            <rect x="240" y="40" width="20" height="15" fill="#475569" />

            {/* Fil du pendule */}
            <line
              x1={pivotX}
              y1={pivotY}
              x2={bobX}
              y2={bobY}
              stroke="#94a3b8"
              strokeWidth="2"
            />

            {/* Référence d'altitude (h=0) */}
            <line x1="50" y1={pivotY + length} x2="450" y2={pivotY + length} stroke="#475569" strokeWidth="1" strokeDasharray="5,5" />
            <text x="460" y={pivotY + length + 5} fill="#475569" fontSize="12">h = 0</text>

            {/* Indication de hauteur */}
            {Math.abs(angle) > 0.05 && (
              <g>
                <line x1={bobX + 30} y1={bobY} x2={bobX + 30} y2={pivotY + length} stroke="#34d399" strokeWidth="1" />
                <line x1={bobX + 25} y1={bobY} x2={bobX + 35} y2={bobY} stroke="#34d399" strokeWidth="1" />
                <line x1={bobX + 25} y1={pivotY + length} x2={bobX + 35} y2={pivotY + length} stroke="#34d399" strokeWidth="1" />
                <text x={bobX + 45} y={(bobY + pivotY + length) / 2 + 5} fill="#34d399" fontSize="11">
                  h = {(energies.h * 100).toFixed(1)} cm
                </text>
              </g>
            )}

            {/* Arc d'angle */}
            {Math.abs(angle) > 0.05 && (
              <path
                d={`M ${pivotX} ${pivotY + 40} A 40 40 0 0 ${angle > 0 ? 1 : 0} ${pivotX + 40 * Math.sin(angle)} ${pivotY + 40 * Math.cos(angle)}`}
                fill="none"
                stroke="#fbbf24"
                strokeWidth="2"
              />
            )}
            <text x={pivotX + 50} y={pivotY + 30} fill="#fbbf24" fontSize="12">
              θ = {(angle * 180 / Math.PI).toFixed(1)}°
            </text>

            {/* Masse */}
            <circle cx={bobX} cy={bobY} r={15 + mass * 5} fill="#22d3ee" />

            {/* Vecteur vitesse */}
            {Math.abs(angularVelocity) > 0.1 && (
              <g>
                <defs>
                  <marker id="arrowVelocity" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                    <polygon points="0 0, 10 3.5, 0 7" fill="#f472b6" />
                  </marker>
                </defs>
                <line
                  x1={bobX}
                  y1={bobY}
                  x2={bobX + energies.v * 15 * Math.cos(angle)}
                  y2={bobY - energies.v * 15 * Math.sin(angle)}
                  stroke="#f472b6"
                  strokeWidth="2"
                  markerEnd="url(#arrowVelocity)"
                />
                <text x={bobX + 30} y={bobY - 25} fill="#f472b6" fontSize="10">
                  v = {Math.abs(energies.v).toFixed(2)} m/s
                </text>
              </g>
            )}

            {/* Trajectoire */}
            <path
              d={`M ${pivotX - length * Math.sin(initialAngle * Math.PI / 180)} ${pivotY + length * Math.cos(initialAngle * Math.PI / 180)}
                  A ${length} ${length} 0 0 1 ${pivotX + length * Math.sin(initialAngle * Math.PI / 180)} ${pivotY + length * Math.cos(initialAngle * Math.PI / 180)}`}
              fill="none"
              stroke="#475569"
              strokeWidth="1"
              strokeDasharray="3,3"
            />

            {/* Légende */}
            <g transform="translate(30, 290)">
              <circle cx="5" cy="0" r="5" fill="#22d3ee" />
              <text x="15" y="4" fill="#94a3b8" fontSize="11">masse m = {mass.toFixed(1)} kg</text>
            </g>
          </svg>
        </div>

        {/* Barres d'énergie */}
        <div className="rounded-lg bg-slate-900 p-4">
          <svg viewBox="0 0 300 350" className="w-full">
            <text x="150" y="25" fill="#e2e8f0" fontSize="14" textAnchor="middle" fontWeight="bold">
              Diagramme énergétique
            </text>

            {/* Barre Ep */}
            <g transform="translate(40, 50)">
              <rect x="0" y={180 - energies.Ep * barScale} width="50" height={energies.Ep * barScale} fill="#34d399" rx="4" />
              <rect x="0" y="0" width="50" height="180" fill="none" stroke="#475569" strokeWidth="1" rx="4" />
              <text x="25" y="200" fill="#34d399" fontSize="12" textAnchor="middle">Ep</text>
              <text x="25" y="215" fill="#34d399" fontSize="10" textAnchor="middle">{energies.Ep.toFixed(2)} J</text>
            </g>

            {/* Barre Ec */}
            <g transform="translate(120, 50)">
              <rect x="0" y={180 - energies.Ec * barScale} width="50" height={energies.Ec * barScale} fill="#f472b6" rx="4" />
              <rect x="0" y="0" width="50" height="180" fill="none" stroke="#475569" strokeWidth="1" rx="4" />
              <text x="25" y="200" fill="#f472b6" fontSize="12" textAnchor="middle">Ec</text>
              <text x="25" y="215" fill="#f472b6" fontSize="10" textAnchor="middle">{energies.Ec.toFixed(2)} J</text>
            </g>

            {/* Barre Em */}
            <g transform="translate(200, 50)">
              <rect x="0" y={180 - energies.Em * barScale} width="50" height={energies.Em * barScale} fill="#fbbf24" rx="4" />
              <rect x="0" y="0" width="50" height="180" fill="none" stroke="#475569" strokeWidth="1" rx="4" />
              <text x="25" y="200" fill="#fbbf24" fontSize="12" textAnchor="middle">Em</text>
              <text x="25" y="215" fill="#fbbf24" fontSize="10" textAnchor="middle">{energies.Em.toFixed(2)} J</text>
              {/* Ligne de référence Em initial */}
              <line x1="-180" y1={180 - initialEm * barScale} x2="50" y2={180 - initialEm * barScale} stroke="#fbbf24" strokeWidth="1" strokeDasharray="3,3" />
            </g>

            {/* Mini graphe temporel */}
            <g transform="translate(30, 260)">
              <text x="120" y="0" fill="#94a3b8" fontSize="11" textAnchor="middle">Évolution temporelle</text>
              <rect x="0" y="10" width="240" height="60" fill="#1e293b" rx="4" />

              {/* Courbes */}
              {energyHistory.length > 1 && (
                <>
                  {/* Ep */}
                  <path
                    d={energyHistory.map((e, i) => `${i === 0 ? 'M' : 'L'} ${i * 2.4} ${65 - e.Ep / maxEnergy * 50}`).join(' ')}
                    fill="none"
                    stroke="#34d399"
                    strokeWidth="1.5"
                    transform="translate(0, 10)"
                  />
                  {/* Ec */}
                  <path
                    d={energyHistory.map((e, i) => `${i === 0 ? 'M' : 'L'} ${i * 2.4} ${65 - e.Ec / maxEnergy * 50}`).join(' ')}
                    fill="none"
                    stroke="#f472b6"
                    strokeWidth="1.5"
                    transform="translate(0, 10)"
                  />
                  {/* Em */}
                  <path
                    d={energyHistory.map((e, i) => `${i === 0 ? 'M' : 'L'} ${i * 2.4} ${65 - e.Em / maxEnergy * 50}`).join(' ')}
                    fill="none"
                    stroke="#fbbf24"
                    strokeWidth="1.5"
                    transform="translate(0, 10)"
                  />
                </>
              )}
            </g>
          </svg>
        </div>
      </div>

      {/* Contrôles */}
      <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        {/* Longueur */}
        <div className="rounded-lg bg-slate-700/50 p-3">
          <label className="mb-1 flex items-center justify-between text-xs text-slate-300">
            <span>Longueur L</span>
            <span className="text-cyan-400">{(length * pixelToMeter * 100).toFixed(0)} cm</span>
          </label>
          <input
            type="range"
            min="100"
            max="300"
            value={length}
            onChange={(e) => { setLength(Number(e.target.value)); reset() }}
            className="w-full accent-cyan-500"
          />
        </div>

        {/* Masse */}
        <div className="rounded-lg bg-slate-700/50 p-3">
          <label className="mb-1 flex items-center justify-between text-xs text-slate-300">
            <span>Masse m</span>
            <span className="text-emerald-400">{mass.toFixed(1)} kg</span>
          </label>
          <input
            type="range"
            min="0.5"
            max="3"
            step="0.1"
            value={mass}
            onChange={(e) => setMass(Number(e.target.value))}
            className="w-full accent-emerald-500"
          />
        </div>

        {/* Angle initial */}
        <div className="rounded-lg bg-slate-700/50 p-3">
          <label className="mb-1 flex items-center justify-between text-xs text-slate-300">
            <span>Angle initial θ₀</span>
            <span className="text-orange-400">{initialAngle}°</span>
          </label>
          <input
            type="range"
            min="10"
            max="80"
            value={initialAngle}
            onChange={(e) => { setInitialAngle(Number(e.target.value)); reset() }}
            className="w-full accent-orange-500"
          />
        </div>

        {/* Frottement */}
        <div className="rounded-lg bg-slate-700/50 p-3">
          <label className="mb-1 flex items-center justify-between text-xs text-slate-300">
            <span>Frottement</span>
            <span className="text-pink-400">{friction.toFixed(2)}</span>
          </label>
          <input
            type="range"
            min="0"
            max="0.5"
            step="0.02"
            value={friction}
            onChange={(e) => setFriction(Number(e.target.value))}
            className="w-full accent-pink-500"
          />
        </div>
      </div>

      {/* Boutons */}
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
          onClick={() => { reset(); setEnergyHistory([]) }}
          className="rounded-lg bg-slate-600 px-6 py-2 font-medium text-white transition-colors hover:bg-slate-500"
        >
          ↺ Réinitialiser
        </button>
      </div>

      {/* Valeurs calculées */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <div className="rounded-lg bg-slate-700/50 p-3 text-center">
          <div className="text-xs text-slate-400">Énergie potentielle</div>
          <div className="text-lg font-bold text-emerald-400">{energies.Ep.toFixed(3)} J</div>
          <div className="text-xs text-slate-500">Ep = mgh</div>
        </div>
        <div className="rounded-lg bg-slate-700/50 p-3 text-center">
          <div className="text-xs text-slate-400">Énergie cinétique</div>
          <div className="text-lg font-bold text-pink-400">{energies.Ec.toFixed(3)} J</div>
          <div className="text-xs text-slate-500">Ec = ½mv²</div>
        </div>
        <div className="rounded-lg bg-slate-700/50 p-3 text-center">
          <div className="text-xs text-slate-400">Énergie mécanique</div>
          <div className="text-lg font-bold text-yellow-400">{energies.Em.toFixed(3)} J</div>
          <div className="text-xs text-slate-500">Em = Ep + Ec</div>
        </div>
        <div className="rounded-lg bg-slate-700/50 p-3 text-center">
          <div className="text-xs text-slate-400">Période T</div>
          <div className="text-lg font-bold text-cyan-400">{period.toFixed(2)} s</div>
          <div className="text-xs text-slate-500">T ≈ 2π√(L/g)</div>
        </div>
      </div>

      {/* Formules */}
      <div className="mt-6 rounded-lg bg-slate-900/50 p-4">
        <h4 className="mb-3 text-sm font-semibold text-slate-300">Conservation de l&apos;énergie mécanique</h4>
        <div className="grid grid-cols-1 gap-3 text-sm md:grid-cols-2">
          <div className="rounded bg-slate-800 p-3">
            <div className="mb-1 text-slate-400">Théorème :</div>
            <div className="font-mono text-yellow-400">Em = Ep + Ec = constante</div>
            <div className="mt-1 text-xs text-slate-500">(si forces non conservatives nulles)</div>
          </div>
          <div className="rounded bg-slate-800 p-3">
            <div className="mb-1 text-slate-400">Variation :</div>
            <div className="font-mono text-pink-400">ΔEm = W(forces non conservatives)</div>
            <div className="mt-1 text-xs text-slate-500">Avec frottement : Em diminue</div>
          </div>
        </div>
      </div>
    </div>
  )
}
