'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

// Types de vibrations moléculaires
const vibrationTypes = [
  { id: 'oh-alcohol', name: 'O-H alcool', wavenumber: 3300, type: 'elongation', width: 400, intensity: 0.7 },
  { id: 'oh-acide', name: 'O-H acide', wavenumber: 3000, type: 'elongation', width: 600, intensity: 0.8 },
  { id: 'nh', name: 'N-H amine', wavenumber: 3400, type: 'elongation', width: 200, intensity: 0.5 },
  { id: 'ch-sp3', name: 'C-H sp³', wavenumber: 2950, type: 'elongation', width: 100, intensity: 0.6 },
  { id: 'ch-sp2', name: 'C-H sp²', wavenumber: 3080, type: 'elongation', width: 80, intensity: 0.4 },
  { id: 'co-aldehyde', name: 'C=O aldéhyde', wavenumber: 1730, type: 'elongation', width: 50, intensity: 0.9 },
  { id: 'co-cetone', name: 'C=O cétone', wavenumber: 1715, type: 'elongation', width: 50, intensity: 0.9 },
  { id: 'co-acide', name: 'C=O acide', wavenumber: 1710, type: 'elongation', width: 60, intensity: 0.85 },
  { id: 'co-ester', name: 'C=O ester', wavenumber: 1740, type: 'elongation', width: 50, intensity: 0.9 },
  { id: 'co-amide', name: 'C=O amide', wavenumber: 1680, type: 'elongation', width: 60, intensity: 0.85 },
  { id: 'cc-double', name: 'C=C', wavenumber: 1650, type: 'elongation', width: 40, intensity: 0.3 },
  { id: 'cc-aromatique', name: 'C=C aromatique', wavenumber: 1600, type: 'elongation', width: 30, intensity: 0.4 },
  { id: 'co-ether', name: 'C-O éther/alcool', wavenumber: 1100, type: 'elongation', width: 100, intensity: 0.7 },
]

export function SpectroscopieIRAnimation() {
  // Groupes fonctionnels sélectionnés
  const [selectedGroups, setSelectedGroups] = useState<string[]>(['oh-alcohol', 'co-aldehyde', 'ch-sp3'])

  // Animation des vibrations
  const [time, setTime] = useState(0)
  const [isPlaying, setIsPlaying] = useState(true)
  const animationRef = useRef<number>()

  // Animation loop
  const animate = useCallback(() => {
    if (isPlaying) {
      setTime(t => t + 0.1)
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

  // Générer le spectre IR
  const generateSpectrum = () => {
    const points: string[] = []
    const startX = 50
    const endX = 750
    const baseY = 250

    // De 4000 à 400 cm⁻¹
    for (let x = startX; x <= endX; x += 2) {
      const wavenumber = 4000 - ((x - startX) / (endX - startX)) * 3600

      // Calcul de la transmittance (somme des absorptions)
      let absorption = 0
      selectedGroups.forEach(groupId => {
        const group = vibrationTypes.find(v => v.id === groupId)
        if (group) {
          // Gaussienne pour chaque bande
          const diff = wavenumber - group.wavenumber
          absorption += group.intensity * Math.exp(-(diff * diff) / (2 * group.width * group.width))
        }
      })

      const transmittance = 1 - Math.min(absorption, 0.95)
      const y = baseY - transmittance * 180

      if (x === startX) {
        points.push(`M ${x} ${y}`)
      } else {
        points.push(`L ${x} ${y}`)
      }
    }

    return points.join(' ')
  }

  // Toggle groupe
  const toggleGroup = (groupId: string) => {
    setSelectedGroups(prev =>
      prev.includes(groupId)
        ? prev.filter(id => id !== groupId)
        : [...prev, groupId]
    )
  }

  // Vibration moléculaire animée
  const renderMoleculeVibration = () => {
    const activeGroup = vibrationTypes.find(v => selectedGroups.includes(v.id))
    if (!activeGroup) return null

    const amplitude = 8 * Math.sin(time * (activeGroup.wavenumber / 500))

    // Représentation simplifiée selon le type de liaison
    if (activeGroup.id.startsWith('oh') || activeGroup.id.startsWith('nh')) {
      // Liaison X-H
      return (
        <g transform="translate(150, 100)">
          <circle cx="0" cy="0" r="20" fill="#64748b" /> {/* Atome lourd */}
          <text x="0" y="5" fill="white" fontSize="12" textAnchor="middle">
            {activeGroup.id.startsWith('oh') ? 'O' : 'N'}
          </text>
          <line x1="20" y1="0" x2={50 + amplitude} y2="0" stroke="#94a3b8" strokeWidth="3" />
          <circle cx={60 + amplitude} cy="0" r="12" fill="#22d3ee" /> {/* H */}
          <text x={60 + amplitude} y="4" fill="white" fontSize="10" textAnchor="middle">H</text>
          <text x="40" y="30" fill="#94a3b8" fontSize="10" textAnchor="middle">élongation</text>
        </g>
      )
    } else if (activeGroup.id.startsWith('co')) {
      // Liaison C=O
      return (
        <g transform="translate(150, 100)">
          <circle cx="0" cy="0" r="20" fill="#475569" /> {/* C */}
          <text x="0" y="5" fill="white" fontSize="12" textAnchor="middle">C</text>
          <line x1="20" y1="-5" x2={50 + amplitude} y2="-5" stroke="#ef4444" strokeWidth="3" />
          <line x1="20" y1="5" x2={50 + amplitude} y2="5" stroke="#ef4444" strokeWidth="3" />
          <circle cx={60 + amplitude} cy="0" r="18" fill="#ef4444" /> {/* O */}
          <text x={60 + amplitude} y="5" fill="white" fontSize="12" textAnchor="middle">O</text>
          <text x="40" y="40" fill="#94a3b8" fontSize="10" textAnchor="middle">élongation C=O</text>
        </g>
      )
    } else if (activeGroup.id.startsWith('ch')) {
      // Liaison C-H
      return (
        <g transform="translate(150, 100)">
          <circle cx="0" cy="0" r="20" fill="#475569" /> {/* C */}
          <text x="0" y="5" fill="white" fontSize="12" textAnchor="middle">C</text>
          <line x1="20" y1="0" x2={45 + amplitude} y2="0" stroke="#94a3b8" strokeWidth="3" />
          <circle cx={55 + amplitude} cy="0" r="10" fill="#22d3ee" /> {/* H */}
          <text x={55 + amplitude} y="4" fill="white" fontSize="9" textAnchor="middle">H</text>
          <text x="35" y="30" fill="#94a3b8" fontSize="10" textAnchor="middle">élongation</text>
        </g>
      )
    } else if (activeGroup.id === 'cc-double') {
      // Liaison C=C
      return (
        <g transform="translate(150, 100)">
          <circle cx={-amplitude/2} cy="0" r="18" fill="#475569" />
          <text x={-amplitude/2} y="5" fill="white" fontSize="11" textAnchor="middle">C</text>
          <line x1={18 - amplitude/2} y1="-4" x2={42 + amplitude/2} y2="-4" stroke="#a78bfa" strokeWidth="3" />
          <line x1={18 - amplitude/2} y1="4" x2={42 + amplitude/2} y2="4" stroke="#a78bfa" strokeWidth="3" />
          <circle cx={60 + amplitude/2} cy="0" r="18" fill="#475569" />
          <text x={60 + amplitude/2} y="5" fill="white" fontSize="11" textAnchor="middle">C</text>
          <text x="30" y="40" fill="#94a3b8" fontSize="10" textAnchor="middle">élongation C=C</text>
        </g>
      )
    }

    return null
  }

  // Zones caractéristiques du spectre
  const spectralZones = [
    { start: 4000, end: 2500, label: 'X-H', color: '#22d3ee' },
    { start: 2500, end: 2000, label: 'Triple', color: '#a78bfa' },
    { start: 2000, end: 1500, label: 'Double', color: '#f472b6' },
    { start: 1500, end: 400, label: 'Empreinte', color: '#fbbf24' },
  ]

  return (
    <div className="my-8 rounded-xl bg-slate-800 p-6">
      <h3 className="mb-4 text-xl font-semibold text-cyan-400">
        Spectroscopie Infrarouge - Vibrations moléculaires
      </h3>

      {/* Zone de visualisation */}
      <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Spectre IR */}
        <div className="rounded-lg bg-slate-900 p-4 lg:col-span-2">
          <svg viewBox="0 0 800 320" className="w-full">
            {/* Zones spectrales */}
            {spectralZones.map((zone, i) => {
              const x1 = 50 + ((4000 - zone.start) / 3600) * 700
              const x2 = 50 + ((4000 - zone.end) / 3600) * 700
              return (
                <g key={i}>
                  <rect x={x1} y="50" width={x2 - x1} height="200" fill={zone.color} opacity="0.1" />
                  <text x={(x1 + x2) / 2} y="42" fill={zone.color} fontSize="10" textAnchor="middle">
                    {zone.label}
                  </text>
                </g>
              )
            })}

            {/* Axes */}
            <line x1="50" y1="250" x2="750" y2="250" stroke="#64748b" strokeWidth="1.5" />
            <line x1="50" y1="50" x2="50" y2="250" stroke="#64748b" strokeWidth="1.5" />

            {/* Graduations X */}
            {[4000, 3500, 3000, 2500, 2000, 1500, 1000, 500].map((wn, i) => {
              const x = 50 + ((4000 - wn) / 3600) * 700
              return (
                <g key={i}>
                  <line x1={x} y1="250" x2={x} y2="255" stroke="#64748b" strokeWidth="1" />
                  <text x={x} y="270" fill="#94a3b8" fontSize="10" textAnchor="middle">{wn}</text>
                </g>
              )
            })}

            {/* Graduations Y */}
            {[0, 25, 50, 75, 100].map((t, i) => {
              const y = 250 - (t / 100) * 180
              return (
                <g key={i}>
                  <line x1="45" y1={y} x2="50" y2={y} stroke="#64748b" strokeWidth="1" />
                  <text x="40" y={y + 4} fill="#94a3b8" fontSize="10" textAnchor="end">{t}</text>
                </g>
              )
            })}

            {/* Labels */}
            <text x="400" y="295" fill="#94a3b8" fontSize="12" textAnchor="middle">
              Nombre d&apos;onde σ (cm⁻¹)
            </text>
            <text x="20" y="150" fill="#94a3b8" fontSize="12" textAnchor="middle" transform="rotate(-90, 20, 150)">
              Transmittance %T
            </text>

            {/* Spectre */}
            <path
              d={generateSpectrum()}
              fill="none"
              stroke="#22d3ee"
              strokeWidth="2"
            />

            {/* Marqueurs pour les groupes sélectionnés */}
            {selectedGroups.map(groupId => {
              const group = vibrationTypes.find(v => v.id === groupId)
              if (!group) return null
              const x = 50 + ((4000 - group.wavenumber) / 3600) * 700
              return (
                <g key={groupId}>
                  <line x1={x} y1="50" x2={x} y2="250" stroke="#f472b6" strokeWidth="1" strokeDasharray="3,3" />
                  <text x={x} y="310" fill="#f472b6" fontSize="9" textAnchor="middle">
                    {group.wavenumber}
                  </text>
                </g>
              )
            })}
          </svg>
        </div>

        {/* Vibration animée */}
        <div className="rounded-lg bg-slate-900 p-4">
          <h4 className="mb-2 text-center text-sm font-semibold text-slate-300">Vibration moléculaire</h4>
          <svg viewBox="0 0 200 150" className="w-full">
            {renderMoleculeVibration()}
            {!selectedGroups.length && (
              <text x="100" y="75" fill="#64748b" fontSize="11" textAnchor="middle">
                Sélectionnez un groupe
              </text>
            )}
          </svg>

          {/* Info groupe actif */}
          {selectedGroups.length > 0 && (
            <div className="mt-2 text-center">
              <div className="text-xs text-slate-400">Groupe actif :</div>
              <div className="text-sm font-medium text-cyan-400">
                {vibrationTypes.find(v => v.id === selectedGroups[0])?.name}
              </div>
              <div className="text-xs text-slate-500">
                σ = {vibrationTypes.find(v => v.id === selectedGroups[0])?.wavenumber} cm⁻¹
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Sélection des groupes */}
      <div className="mb-6">
        <h4 className="mb-3 text-sm font-semibold text-slate-300">Groupes fonctionnels</h4>
        <div className="grid grid-cols-2 gap-2 md:grid-cols-4 lg:grid-cols-5">
          {vibrationTypes.map(group => (
            <button
              key={group.id}
              onClick={() => toggleGroup(group.id)}
              className={`rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                selectedGroups.includes(group.id)
                  ? 'bg-cyan-600 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              <div>{group.name}</div>
              <div className="text-[10px] opacity-70">{group.wavenumber} cm⁻¹</div>
            </button>
          ))}
        </div>
      </div>

      {/* Contrôles */}
      <div className="mb-6 flex justify-center gap-4">
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className={`rounded-lg px-6 py-2 font-medium transition-colors ${
            isPlaying
              ? 'bg-amber-600 hover:bg-amber-700 text-white'
              : 'bg-emerald-600 hover:bg-emerald-700 text-white'
          }`}
        >
          {isPlaying ? '⏸ Pause' : '▶ Animer'}
        </button>
        <button
          onClick={() => setSelectedGroups([])}
          className="rounded-lg bg-slate-600 px-6 py-2 font-medium text-white transition-colors hover:bg-slate-500"
        >
          Effacer tout
        </button>
      </div>

      {/* Tableau récapitulatif */}
      <div className="rounded-lg bg-slate-900/50 p-4">
        <h4 className="mb-3 text-sm font-semibold text-slate-300">Bandes d&apos;absorption caractéristiques</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="px-3 py-2 text-left text-slate-400">Liaison</th>
                <th className="px-3 py-2 text-left text-slate-400">σ (cm⁻¹)</th>
                <th className="px-3 py-2 text-left text-slate-400">Intensité</th>
                <th className="px-3 py-2 text-left text-slate-400">Aspect</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-slate-800">
                <td className="px-3 py-2 text-cyan-400">O-H alcool</td>
                <td className="px-3 py-2">3200-3400</td>
                <td className="px-3 py-2">Forte</td>
                <td className="px-3 py-2">Large</td>
              </tr>
              <tr className="border-b border-slate-800">
                <td className="px-3 py-2 text-cyan-400">O-H acide</td>
                <td className="px-3 py-2">2500-3300</td>
                <td className="px-3 py-2">Forte</td>
                <td className="px-3 py-2">Très large</td>
              </tr>
              <tr className="border-b border-slate-800">
                <td className="px-3 py-2 text-emerald-400">N-H</td>
                <td className="px-3 py-2">3300-3500</td>
                <td className="px-3 py-2">Moyenne</td>
                <td className="px-3 py-2">Fine (1 ou 2 bandes)</td>
              </tr>
              <tr className="border-b border-slate-800">
                <td className="px-3 py-2 text-slate-300">C-H</td>
                <td className="px-3 py-2">2800-3100</td>
                <td className="px-3 py-2">Moyenne</td>
                <td className="px-3 py-2">Fine</td>
              </tr>
              <tr className="border-b border-slate-800">
                <td className="px-3 py-2 text-red-400">C=O</td>
                <td className="px-3 py-2">1650-1750</td>
                <td className="px-3 py-2">Forte</td>
                <td className="px-3 py-2">Fine et intense</td>
              </tr>
              <tr className="border-b border-slate-800">
                <td className="px-3 py-2 text-purple-400">C=C</td>
                <td className="px-3 py-2">1620-1680</td>
                <td className="px-3 py-2">Variable</td>
                <td className="px-3 py-2">Fine</td>
              </tr>
              <tr>
                <td className="px-3 py-2 text-orange-400">C-O</td>
                <td className="px-3 py-2">1000-1300</td>
                <td className="px-3 py-2">Forte</td>
                <td className="px-3 py-2">Large</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
