'use client'

import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { MathInline } from './SvgMath'

export default function OndesSonoresAnimation() {
  // Paramètres de l'onde sonore
  const [frequency, setFrequency] = useState(440) // Hz (La4)
  const [amplitude, setAmplitude] = useState(50)
  const [showPressure, setShowPressure] = useState(true)
  const [showParticles, setShowParticles] = useState(true)

  // Animation
  const [time, setTime] = useState(0)
  const [isPlaying, setIsPlaying] = useState(true)
  const animationRef = useRef<number>()
  const lastTimeRef = useRef<number>(0)

  // Vitesse du son
  const speedOfSound = 340 // m/s

  // Animation loop
  const animate = useCallback((timestamp: number) => {
    if (lastTimeRef.current === 0) {
      lastTimeRef.current = timestamp
    }
    const delta = (timestamp - lastTimeRef.current) / 1000
    lastTimeRef.current = timestamp

    if (isPlaying) {
      setTime(t => t + delta * 2)
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

  // Calculs
  const wavelength = useMemo(() => speedOfSound / frequency, [frequency])
  const period = useMemo(() => 1 / frequency, [frequency])

  // Génération de l'onde de pression
  const generatePressurePath = useCallback((): string => {
    const points: string[] = []
    const startX = 100
    const endX = 700
    const centerY = 150
    const k = (2 * Math.PI) / 120 // nombre d'onde visuel
    const omega = 2 * Math.PI * (frequency / 100) // fréquence visuelle

    for (let x = startX; x <= endX; x += 2) {
      const y = centerY - amplitude * Math.sin(k * (x - startX) - omega * time)
      if (x === startX) {
        points.push(`M ${x} ${y}`)
      } else {
        points.push(`L ${x} ${y}`)
      }
    }

    return points.join(' ')
  }, [amplitude, time, frequency])

  // Particules d'air
  const particles = useMemo(() => {
    const result: Array<{ x: number; baseX: number; y: number; displacement: number }> = []
    const k = (2 * Math.PI) / 120
    const omega = 2 * Math.PI * (frequency / 100)

    for (let i = 0; i < 25; i++) {
      for (let j = 0; j < 3; j++) {
        const baseX = 120 + i * 25
        const y = 280 + j * 30
        const displacement = (amplitude / 3) * Math.cos(k * (baseX - 100) - omega * time)
        result.push({ x: baseX + displacement, baseX, y, displacement })
      }
    }
    return result
  }, [amplitude, time, frequency])

  // Note musicale
  const noteName = useMemo(() => {
    const notes = ['Do', 'Do#', 'Ré', 'Ré#', 'Mi', 'Fa', 'Fa#', 'Sol', 'Sol#', 'La', 'La#', 'Si']
    const A4 = 440
    const semitones = Math.round(12 * Math.log2(frequency / A4))
    const noteIndex = ((semitones % 12) + 12 + 9) % 12 // La = index 9
    const octave = Math.floor((semitones + 9) / 12) + 4
    return `${notes[noteIndex]}${octave}`
  }, [frequency])

  // Intensité sonore approximative
  const intensityLevel = useMemo(() => {
    // Niveau en dB approximatif basé sur l'amplitude
    return Math.round(20 * Math.log10(amplitude / 10) + 60)
  }, [amplitude])

  return (
    <div className="my-8 rounded-xl bg-slate-800 p-6">
      <h3 className="mb-4 text-xl font-semibold text-cyan-400">
        Ondes sonores - Propagation et caractéristiques
      </h3>

      {/* Zone de visualisation */}
      <div className="mb-6 rounded-lg bg-slate-900 p-4">
        <svg viewBox="0 0 800 400" className="w-full">
          {/* Grille */}
          <defs>
            <pattern id="gridSound" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#334155" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect x="80" y="50" width="640" height="140" fill="url(#gridSound)" />

          {/* Source sonore (haut-parleur) */}
          <g transform="translate(50, 130)">
            <rect x="0" y="-30" width="30" height="60" fill="#475569" rx="3" />
            <ellipse cx="35" cy="0" rx="15" ry="25" fill="#64748b" />
            <ellipse cx="35" cy="0" rx="8" ry="15" fill="#334155" />
            {/* Ondes de propagation */}
            {[1, 2, 3].map(i => (
              <path
                key={i}
                d={`M 50 ${-20 * i} Q 60 0 50 ${20 * i}`}
                fill="none"
                stroke="#22d3ee"
                strokeWidth="1.5"
                opacity={0.5 - i * 0.1}
              />
            ))}
          </g>

          {/* Titre section pression */}
          <text x="400" y="45" fill="#94a3b8" fontSize="12" textAnchor="middle">
            Variation de pression P(x,t)
          </text>

          {/* Axe de pression */}
          <line x1="100" y1="150" x2="700" y2="150" stroke="#64748b" strokeWidth="1" strokeDasharray="5,5" />
          <text x="85" y="100" fill="#94a3b8" fontSize="10" textAnchor="end">+ΔP</text>
          <text x="85" y="155" fill="#94a3b8" fontSize="10" textAnchor="end">P₀</text>
          <text x="85" y="200" fill="#94a3b8" fontSize="10" textAnchor="end">-ΔP</text>

          {/* Onde de pression */}
          {showPressure && (
            <path
              d={generatePressurePath()}
              fill="none"
              stroke="#22d3ee"
              strokeWidth="2.5"
            />
          )}

          {/* Zones de compression/dilatation */}
          <g transform="translate(100, 220)">
            <text x="300" y="0" fill="#94a3b8" fontSize="12" textAnchor="middle">
              Déplacement des particules d&apos;air
            </text>

            {/* Légende */}
            <g transform="translate(450, -10)">
              <rect x="0" y="0" width="15" height="15" fill="#ef4444" opacity="0.3" />
              <text x="20" y="12" fill="#ef4444" fontSize="10">Compression</text>
              <rect x="100" y="0" width="15" height="15" fill="#3b82f6" opacity="0.3" />
              <text x="120" y="12" fill="#3b82f6" fontSize="10">Dilatation</text>
            </g>
          </g>

          {/* Particules d'air */}
          {showParticles && particles.map((p, i) => {
            const isCompressed = p.displacement > 5
            const isDilated = p.displacement < -5
            return (
              <circle
                key={i}
                cx={p.x}
                cy={p.y}
                r={4}
                fill={isCompressed ? '#ef4444' : isDilated ? '#3b82f6' : '#64748b'}
                opacity={0.8}
              />
            )
          })}

          {/* Zones colorées compression/dilatation */}
          {showParticles && (
            <g opacity="0.15">
              {Array.from({ length: 5 }).map((_, i) => {
                const k = (2 * Math.PI) / 120
                const omega = 2 * Math.PI * (frequency / 100)
                const x = 120 + i * 120
                const phase = k * (x - 100) - omega * time
                const isCompression = Math.sin(phase) > 0.3
                const isDilation = Math.sin(phase) < -0.3
                if (!isCompression && !isDilation) return null
                return (
                  <rect
                    key={i}
                    x={x}
                    y={250}
                    width={60}
                    height={100}
                    fill={isCompression ? '#ef4444' : '#3b82f6'}
                    rx="5"
                  />
                )
              })}
            </g>
          )}

          {/* Indication longueur d'onde */}
          <g transform="translate(150, 370)">
            <line x1="0" y1="0" x2="120" y2="0" stroke="#a78bfa" strokeWidth="2" />
            <line x1="0" y1="-5" x2="0" y2="5" stroke="#a78bfa" strokeWidth="2" />
            <line x1="120" y1="-5" x2="120" y2="5" stroke="#a78bfa" strokeWidth="2" />
            <text x="60" y="18" fill="#a78bfa" fontSize="11" textAnchor="middle">
              λ = {(wavelength * 100).toFixed(1)} cm
            </text>
          </g>

          {/* Infos note */}
          <g transform="translate(600, 370)">
            <text x="0" y="0" fill="#fbbf24" fontSize="14" fontWeight="bold">♪ {noteName}</text>
            <text x="60" y="0" fill="#94a3b8" fontSize="11">{frequency} Hz</text>
          </g>
        </svg>
      </div>

      {/* Contrôles */}
      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Fréquence */}
        <div className="rounded-lg bg-slate-700/50 p-4">
          <label className="mb-2 flex items-center justify-between text-sm text-slate-300">
            <span>Fréquence f</span>
            <span className="text-cyan-400">{frequency} Hz</span>
          </label>
          <input
            type="range"
            min="100"
            max="2000"
            step="10"
            value={frequency}
            onChange={(e) => setFrequency(Number(e.target.value))}
            className="w-full accent-cyan-500"
          />
          <div className="mt-1 flex justify-between text-xs text-slate-500">
            <span>Grave</span>
            <span>Aigu</span>
          </div>
        </div>

        {/* Amplitude */}
        <div className="rounded-lg bg-slate-700/50 p-4">
          <label className="mb-2 flex items-center justify-between text-sm text-slate-300">
            <span>Amplitude</span>
            <span className="text-emerald-400">≈ {intensityLevel} dB</span>
          </label>
          <input
            type="range"
            min="10"
            max="80"
            value={amplitude}
            onChange={(e) => setAmplitude(Number(e.target.value))}
            className="w-full accent-emerald-500"
          />
          <div className="mt-1 flex justify-between text-xs text-slate-500">
            <span>Faible</span>
            <span>Fort</span>
          </div>
        </div>

        {/* Notes de référence */}
        <div className="rounded-lg bg-slate-700/50 p-4">
          <label className="mb-2 block text-sm text-slate-300">Notes de référence</label>
          <div className="flex flex-wrap gap-1">
            {[
              { name: 'La₃', f: 220 },
              { name: 'Do₄', f: 262 },
              { name: 'La₄', f: 440 },
              { name: 'Do₅', f: 523 },
              { name: 'La₅', f: 880 },
            ].map(note => (
              <button
                key={note.f}
                onClick={() => setFrequency(note.f)}
                className={`rounded px-2 py-1 text-xs font-medium transition-colors ${
                  Math.abs(frequency - note.f) < 10
                    ? 'bg-yellow-600 text-white'
                    : 'bg-slate-600 text-slate-300 hover:bg-slate-500'
                }`}
              >
                {note.name}
              </button>
            ))}
          </div>
        </div>

        {/* Options */}
        <div className="rounded-lg bg-slate-700/50 p-4">
          <label className="mb-2 block text-sm text-slate-300">Affichage</label>
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm text-slate-300">
              <input
                type="checkbox"
                checked={showPressure}
                onChange={(e) => setShowPressure(e.target.checked)}
                className="rounded accent-cyan-500"
              />
              Onde de pression
            </label>
            <label className="flex items-center gap-2 text-sm text-slate-300">
              <input
                type="checkbox"
                checked={showParticles}
                onChange={(e) => setShowParticles(e.target.checked)}
                className="rounded accent-blue-500"
              />
              Particules d&apos;air
            </label>
          </div>
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
          onClick={() => setTime(0)}
          className="rounded-lg bg-slate-600 px-6 py-2 font-medium text-white transition-colors hover:bg-slate-500"
        >
          ↺ Réinitialiser
        </button>
      </div>

      {/* Grandeurs */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <div className="rounded-lg bg-slate-700/50 p-3 text-center">
          <div className="text-xs text-slate-400">Période T</div>
          <div className="text-lg font-bold text-cyan-400">{(period * 1000).toFixed(2)} ms</div>
          <div className="text-xs text-slate-500"><MathInline>{String.raw`T = \frac{1}{f}`}</MathInline></div>
        </div>
        <div className="rounded-lg bg-slate-700/50 p-3 text-center">
          <div className="text-xs text-slate-400">Longueur d&apos;onde λ</div>
          <div className="text-lg font-bold text-purple-400">{(wavelength * 100).toFixed(1)} cm</div>
          <div className="text-xs text-slate-500"><MathInline>{String.raw`\lambda = \frac{v}{f}`}</MathInline></div>
        </div>
        <div className="rounded-lg bg-slate-700/50 p-3 text-center">
          <div className="text-xs text-slate-400">Célérité v</div>
          <div className="text-lg font-bold text-orange-400">{speedOfSound} m/s</div>
          <div className="text-xs text-slate-500">(dans l&apos;air à 20°C)</div>
        </div>
        <div className="rounded-lg bg-slate-700/50 p-3 text-center">
          <div className="text-xs text-slate-400">Note</div>
          <div className="text-lg font-bold text-yellow-400">♪ {noteName}</div>
          <div className="text-xs text-slate-500">{frequency} Hz</div>
        </div>
      </div>

      {/* Formules */}
      <div className="mt-6 rounded-lg bg-slate-900/50 p-4">
        <h4 className="mb-3 text-sm font-semibold text-slate-300">Caractéristiques des ondes sonores</h4>
        <div className="grid grid-cols-1 gap-3 text-sm md:grid-cols-2">
          <div className="rounded bg-slate-800 p-3">
            <div className="mb-1 text-slate-400">Célérité du son :</div>
            <div className="text-cyan-400"><MathInline>{String.raw`v = \lambda f = \frac{\lambda}{T}`}</MathInline></div>
          </div>
          <div className="rounded bg-slate-800 p-3">
            <div className="mb-1 text-slate-400">Niveau sonore :</div>
            <div className="text-emerald-400"><MathInline>{String.raw`L = 10\log\left(\frac{I}{I_0}\right)`}</MathInline> dB</div>
          </div>
          <div className="rounded bg-slate-800 p-3">
            <div className="mb-1 text-slate-400">Domaine audible :</div>
            <div className="text-orange-400">20 Hz &lt; f &lt; 20 000 Hz</div>
          </div>
          <div className="rounded bg-slate-800 p-3">
            <div className="mb-1 text-slate-400">Nature :</div>
            <div className="text-purple-400">Onde longitudinale de pression</div>
          </div>
        </div>
      </div>
    </div>
  )
}
