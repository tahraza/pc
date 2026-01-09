'use client'

import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { MathInline } from './SvgMath'

export default function OndesLumineusesAnimation() {
  // Paramètres de l'onde
  const [wavelength, setWavelength] = useState(550) // nm (vert)
  const [amplitude, setAmplitude] = useState(50)
  const [showMagneticField, setShowMagneticField] = useState(true)
  const [polarization, setPolarization] = useState<'linear' | 'circular'>('linear')
  const [polarizationAngle, setPolarizationAngle] = useState(0) // degrés

  // Animation
  const [time, setTime] = useState(0)
  const [isPlaying, setIsPlaying] = useState(true)
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

  // Couleur basée sur la longueur d'onde
  const wavelengthColor = useMemo(() => {
    if (wavelength < 380) return '#8B00FF'
    if (wavelength < 440) return `rgb(${Math.round((440-wavelength)/(440-380)*255)}, 0, 255)`
    if (wavelength < 490) return `rgb(0, ${Math.round((wavelength-440)/(490-440)*255)}, 255)`
    if (wavelength < 510) return `rgb(0, 255, ${Math.round((510-wavelength)/(510-490)*255)})`
    if (wavelength < 580) return `rgb(${Math.round((wavelength-510)/(580-510)*255)}, 255, 0)`
    if (wavelength < 645) return `rgb(255, ${Math.round((645-wavelength)/(645-580)*255)}, 0)`
    return '#FF0000'
  }, [wavelength])

  // Fréquence et période
  const frequency = useMemo(() => {
    const c = 3e8 // m/s
    const lambdaM = wavelength * 1e-9
    return c / lambdaM
  }, [wavelength])

  // Génération de l'onde électrique
  const generateEFieldPath = useCallback((phase: number = 0): string => {
    const points: string[] = []
    const startX = 50
    const endX = 700
    const centerY = 200
    const k = (2 * Math.PI) / 100 // nombre d'onde visuel

    for (let x = startX; x <= endX; x += 3) {
      let y: number
      if (polarization === 'linear') {
        const angle = polarizationAngle * Math.PI / 180
        y = centerY - amplitude * Math.sin(k * (x - startX) - time * 3 + phase) * Math.cos(angle)
      } else {
        // Polarisation circulaire
        y = centerY - amplitude * Math.sin(k * (x - startX) - time * 3 + phase)
      }

      if (x === startX) {
        points.push(`M ${x} ${y}`)
      } else {
        points.push(`L ${x} ${y}`)
      }
    }

    return points.join(' ')
  }, [amplitude, time, polarization, polarizationAngle])

  // Génération de l'onde magnétique (perpendiculaire)
  const generateBFieldPath = useCallback((): string => {
    const points: string[] = []
    const startX = 50
    const endX = 700
    const centerY = 200
    const k = (2 * Math.PI) / 100

    for (let x = startX; x <= endX; x += 3) {
      // Le champ B est perpendiculaire à E et en phase
      let z: number
      if (polarization === 'linear') {
        const angle = polarizationAngle * Math.PI / 180
        z = amplitude * 0.6 * Math.sin(k * (x - startX) - time * 3) * Math.sin(angle + Math.PI/2)
      } else {
        z = amplitude * 0.6 * Math.cos(k * (x - startX) - time * 3)
      }

      // Projection en perspective
      const y = 200 + z * 0.5
      const xProj = x + z * 0.3

      if (x === startX) {
        points.push(`M ${xProj} ${y}`)
      } else {
        points.push(`L ${xProj} ${y}`)
      }
    }

    return points.join(' ')
  }, [amplitude, time, polarization, polarizationAngle])

  // Vecteurs E et B à un point
  const vectorX = 400
  const eFieldY = useMemo(() => {
    const k = (2 * Math.PI) / 100
    if (polarization === 'linear') {
      const angle = polarizationAngle * Math.PI / 180
      return amplitude * Math.sin(k * (vectorX - 50) - time * 3) * Math.cos(angle)
    }
    return amplitude * Math.sin(k * (vectorX - 50) - time * 3)
  }, [amplitude, time, polarization, polarizationAngle, vectorX])

  const bFieldZ = useMemo(() => {
    const k = (2 * Math.PI) / 100
    if (polarization === 'linear') {
      return amplitude * 0.6 * Math.sin(k * (vectorX - 50) - time * 3)
    }
    return amplitude * 0.6 * Math.cos(k * (vectorX - 50) - time * 3)
  }, [amplitude, time, polarization, vectorX])

  return (
    <div className="my-8 rounded-xl bg-slate-800 p-6">
      <h3 className="mb-4 text-xl font-semibold text-cyan-400">
        Ondes électromagnétiques - Lumière
      </h3>

      {/* Zone de visualisation */}
      <div className="mb-6 rounded-lg bg-slate-900 p-4">
        <svg viewBox="0 0 800 400" className="w-full">
          {/* Grille de fond */}
          <defs>
            <pattern id="gridEM" width="50" height="50" patternUnits="userSpaceOnUse">
              <path d="M 50 0 L 0 0 0 50" fill="none" stroke="#334155" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect x="50" y="50" width="700" height="300" fill="url(#gridEM)" />

          {/* Axe de propagation */}
          <line x1="50" y1="200" x2="750" y2="200" stroke="#64748b" strokeWidth="1" strokeDasharray="5,5" />
          <text x="760" y="205" fill="#64748b" fontSize="14">x</text>

          {/* Axes E et B */}
          <line x1="50" y1="50" x2="50" y2="350" stroke="#64748b" strokeWidth="1" />
          <text x="35" y="55" fill="#ef4444" fontSize="12">E</text>

          {showMagneticField && (
            <>
              <line x1="50" y1="200" x2="100" y2="250" stroke="#64748b" strokeWidth="1" strokeDasharray="3,3" />
              <text x="105" y="260" fill="#3b82f6" fontSize="12">B</text>
            </>
          )}

          {/* Direction de propagation */}
          <g transform="translate(650, 80)">
            <line x1="0" y1="0" x2="50" y2="0" stroke="#fbbf24" strokeWidth="2" markerEnd="url(#arrowProp)" />
            <defs>
              <marker id="arrowProp" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                <polygon points="0 0, 10 3.5, 0 7" fill="#fbbf24" />
              </marker>
            </defs>
            <text x="25" y="-10" fill="#fbbf24" fontSize="11" textAnchor="middle">c</text>
          </g>

          {/* Onde champ électrique E */}
          <path
            d={generateEFieldPath()}
            fill="none"
            stroke={wavelengthColor}
            strokeWidth="2.5"
          />

          {/* Onde champ magnétique B */}
          {showMagneticField && (
            <path
              d={generateBFieldPath()}
              fill="none"
              stroke="#3b82f6"
              strokeWidth="2"
              strokeDasharray="6,3"
            />
          )}

          {/* Vecteurs E et B au point */}
          <g transform={`translate(${vectorX}, 200)`}>
            {/* Vecteur E (vertical) */}
            <line x1="0" y1="0" x2="0" y2={-eFieldY} stroke="#ef4444" strokeWidth="3" markerEnd="url(#arrowE)" />
            <defs>
              <marker id="arrowE" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
                <polygon points="0 0, 8 3, 0 6" fill="#ef4444" />
              </marker>
            </defs>
            {Math.abs(eFieldY) > 10 && (
              <text x="10" y={-eFieldY/2} fill="#ef4444" fontSize="14" fontWeight="bold">E</text>
            )}

            {/* Vecteur B (perpendiculaire) */}
            {showMagneticField && (
              <>
                <line x1="0" y1="0" x2={bFieldZ * 0.5} y2={bFieldZ * 0.3} stroke="#3b82f6" strokeWidth="3" markerEnd="url(#arrowB)" />
                <defs>
                  <marker id="arrowB" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
                    <polygon points="0 0, 8 3, 0 6" fill="#3b82f6" />
                  </marker>
                </defs>
                {Math.abs(bFieldZ) > 10 && (
                  <text x={bFieldZ * 0.3 + 10} y={bFieldZ * 0.2} fill="#3b82f6" fontSize="14" fontWeight="bold">B</text>
                )}
              </>
            )}
          </g>

          {/* Indication longueur d'onde */}
          <g transform="translate(150, 320)">
            <line x1="0" y1="0" x2="100" y2="0" stroke="#a78bfa" strokeWidth="2" />
            <line x1="0" y1="-5" x2="0" y2="5" stroke="#a78bfa" strokeWidth="2" />
            <line x1="100" y1="-5" x2="100" y2="5" stroke="#a78bfa" strokeWidth="2" />
            <text x="50" y="20" fill="#a78bfa" fontSize="12" textAnchor="middle">λ = {wavelength} nm</text>
          </g>

          {/* Légende */}
          <g transform="translate(550, 320)">
            <line x1="0" y1="0" x2="25" y2="0" stroke={wavelengthColor} strokeWidth="2" />
            <text x="30" y="4" fill={wavelengthColor} fontSize="11">Champ E</text>
            {showMagneticField && (
              <>
                <line x1="100" y1="0" x2="125" y2="0" stroke="#3b82f6" strokeWidth="2" strokeDasharray="4,2" />
                <text x="130" y="4" fill="#3b82f6" fontSize="11">Champ B</text>
              </>
            )}
          </g>

          {/* Spectre visible */}
          <g transform="translate(50, 370)">
            <defs>
              <linearGradient id="spectrumGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#8B00FF" />
                <stop offset="15%" stopColor="#0000FF" />
                <stop offset="30%" stopColor="#00FFFF" />
                <stop offset="45%" stopColor="#00FF00" />
                <stop offset="60%" stopColor="#FFFF00" />
                <stop offset="75%" stopColor="#FF7F00" />
                <stop offset="100%" stopColor="#FF0000" />
              </linearGradient>
            </defs>
            <rect x="0" y="0" width="300" height="15" fill="url(#spectrumGrad)" rx="3" />
            <text x="0" y="28" fill="#94a3b8" fontSize="9">380</text>
            <text x="150" y="28" fill="#94a3b8" fontSize="9" textAnchor="middle">550</text>
            <text x="300" y="28" fill="#94a3b8" fontSize="9" textAnchor="end">780 nm</text>
            {/* Indicateur position */}
            <line
              x1={(wavelength - 380) / 400 * 300}
              y1="-5"
              x2={(wavelength - 380) / 400 * 300}
              y2="20"
              stroke="white"
              strokeWidth="2"
            />
          </g>
        </svg>
      </div>

      {/* Contrôles */}
      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Longueur d'onde */}
        <div className="rounded-lg bg-slate-700/50 p-4">
          <label className="mb-2 flex items-center justify-between text-sm text-slate-300">
            <span>Longueur d&apos;onde λ</span>
            <span style={{ color: wavelengthColor }}>{wavelength} nm</span>
          </label>
          <input
            type="range"
            min="380"
            max="780"
            value={wavelength}
            onChange={(e) => setWavelength(Number(e.target.value))}
            className="w-full"
            style={{ accentColor: wavelengthColor }}
          />
        </div>

        {/* Amplitude */}
        <div className="rounded-lg bg-slate-700/50 p-4">
          <label className="mb-2 flex items-center justify-between text-sm text-slate-300">
            <span>Amplitude</span>
            <span className="text-red-400">{amplitude}</span>
          </label>
          <input
            type="range"
            min="20"
            max="80"
            value={amplitude}
            onChange={(e) => setAmplitude(Number(e.target.value))}
            className="w-full accent-red-500"
          />
        </div>

        {/* Polarisation */}
        <div className="rounded-lg bg-slate-700/50 p-4">
          <label className="mb-2 block text-sm text-slate-300">Polarisation</label>
          <div className="flex gap-2">
            <button
              onClick={() => setPolarization('linear')}
              className={`flex-1 rounded py-1 text-sm font-medium transition-colors ${
                polarization === 'linear'
                  ? 'bg-purple-600 text-white'
                  : 'bg-slate-600 text-slate-300 hover:bg-slate-500'
              }`}
            >
              Linéaire
            </button>
            <button
              onClick={() => setPolarization('circular')}
              className={`flex-1 rounded py-1 text-sm font-medium transition-colors ${
                polarization === 'circular'
                  ? 'bg-purple-600 text-white'
                  : 'bg-slate-600 text-slate-300 hover:bg-slate-500'
              }`}
            >
              Circulaire
            </button>
          </div>
          {polarization === 'linear' && (
            <div className="mt-2">
              <label className="text-xs text-slate-400">Angle: {polarizationAngle}°</label>
              <input
                type="range"
                min="0"
                max="180"
                value={polarizationAngle}
                onChange={(e) => setPolarizationAngle(Number(e.target.value))}
                className="w-full accent-purple-500"
              />
            </div>
          )}
        </div>

        {/* Options */}
        <div className="rounded-lg bg-slate-700/50 p-4">
          <label className="mb-2 block text-sm text-slate-300">Affichage</label>
          <label className="flex items-center gap-2 text-sm text-slate-300">
            <input
              type="checkbox"
              checked={showMagneticField}
              onChange={(e) => setShowMagneticField(e.target.checked)}
              className="rounded accent-blue-500"
            />
            Champ magnétique B
          </label>
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

      {/* Grandeurs */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <div className="rounded-lg bg-slate-700/50 p-3 text-center">
          <div className="text-xs text-slate-400">Fréquence ν</div>
          <div className="text-lg font-bold text-cyan-400">{(frequency / 1e12).toFixed(1)} THz</div>
        </div>
        <div className="rounded-lg bg-slate-700/50 p-3 text-center">
          <div className="text-xs text-slate-400">Énergie photon</div>
          <div className="text-lg font-bold text-yellow-400">{(6.626e-34 * frequency / 1.602e-19).toFixed(2)} eV</div>
        </div>
        <div className="rounded-lg bg-slate-700/50 p-3 text-center">
          <div className="text-xs text-slate-400">Célérité</div>
          <div className="text-lg font-bold text-orange-400">c = 3×10⁸ m/s</div>
        </div>
        <div className="rounded-lg bg-slate-700/50 p-3 text-center">
          <div className="text-xs text-slate-400">Couleur</div>
          <div className="text-lg font-bold" style={{ color: wavelengthColor }}>
            {wavelength < 450 ? 'Violet/Bleu' :
             wavelength < 495 ? 'Cyan' :
             wavelength < 570 ? 'Vert' :
             wavelength < 590 ? 'Jaune' :
             wavelength < 620 ? 'Orange' : 'Rouge'}
          </div>
        </div>
      </div>

      {/* Formules */}
      <div className="mt-6 rounded-lg bg-slate-900/50 p-4">
        <h4 className="mb-3 text-sm font-semibold text-slate-300">Ondes électromagnétiques</h4>
        <div className="grid grid-cols-1 gap-3 text-sm md:grid-cols-2">
          <div className="rounded bg-slate-800 p-3">
            <div className="mb-1 text-slate-400">Relation fondamentale :</div>
            <div className="text-cyan-400"><MathInline>{String.raw`c = \lambda \nu = \frac{\omega}{k}`}</MathInline></div>
          </div>
          <div className="rounded bg-slate-800 p-3">
            <div className="mb-1 text-slate-400">Énergie du photon :</div>
            <div className="text-yellow-400"><MathInline>{String.raw`E = h\nu = \frac{hc}{\lambda}`}</MathInline></div>
          </div>
          <div className="rounded bg-slate-800 p-3">
            <div className="mb-1 text-slate-400">Champs E et B :</div>
            <div className="text-red-400"><MathInline>{String.raw`\vec{E} \perp \vec{B} \perp \vec{c}`}</MathInline></div>
          </div>
          <div className="rounded bg-slate-800 p-3">
            <div className="mb-1 text-slate-400">Relation E/B :</div>
            <div className="text-blue-400"><MathInline>{String.raw`E = cB`}</MathInline></div>
          </div>
        </div>
      </div>
    </div>
  )
}
