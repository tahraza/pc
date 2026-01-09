'use client'

import { useState, useMemo } from 'react'

export function EquilibresChimiquesAnimation() {
  // Concentrations initiales
  const [cA, setCA] = useState(1.0)
  const [cB, setCB] = useState(1.0)
  const [cC, setCC] = useState(0.1)
  const [cD, setCD] = useState(0.1)

  // Constante d'équilibre
  const [K, setK] = useState(1.0)

  // Coefficients stœchiométriques (a A + b B ⇌ c C + d D)
  const [coeffA] = useState(1)
  const [coeffB] = useState(1)
  const [coeffC] = useState(1)
  const [coeffD] = useState(1)

  // Calcul du quotient de réaction
  const Qr = useMemo(() => {
    const numerator = Math.pow(cC, coeffC) * Math.pow(cD, coeffD)
    const denominator = Math.pow(cA, coeffA) * Math.pow(cB, coeffB)
    return denominator > 0 ? numerator / denominator : 0
  }, [cA, cB, cC, cD, coeffA, coeffB, coeffC, coeffD])

  // Déterminer le sens d'évolution
  const evolutionSens = useMemo(() => {
    if (Math.abs(Qr - K) < 0.01) return 'equilibre'
    return Qr < K ? 'direct' : 'inverse'
  }, [Qr, K])

  // Calcul des concentrations à l'équilibre (approximation)
  const equilibriumState = useMemo(() => {
    // Résolution numérique simplifiée
    let a = cA, b = cB, c = cC, d = cD
    const step = 0.01
    const maxIterations = 1000

    for (let i = 0; i < maxIterations; i++) {
      const q = (Math.pow(c, coeffC) * Math.pow(d, coeffD)) /
                (Math.pow(a, coeffA) * Math.pow(b, coeffB) + 0.0001)

      if (Math.abs(q - K) < 0.001) break

      if (q < K) {
        // Sens direct
        const delta = Math.min(step, a / coeffA, b / coeffB)
        a -= delta * coeffA
        b -= delta * coeffB
        c += delta * coeffC
        d += delta * coeffD
      } else {
        // Sens inverse
        const delta = Math.min(step, c / coeffC, d / coeffD)
        a += delta * coeffA
        b += delta * coeffB
        c -= delta * coeffC
        d -= delta * coeffD
      }

      // Éviter les concentrations négatives
      a = Math.max(0.001, a)
      b = Math.max(0.001, b)
      c = Math.max(0.001, c)
      d = Math.max(0.001, d)
    }

    return { cA: a, cB: b, cC: c, cD: d }
  }, [cA, cB, cC, cD, K, coeffA, coeffB, coeffC, coeffD])

  // Barres de visualisation
  const maxConc = 2.0
  const barHeight = (c: number) => Math.min((c / maxConc) * 150, 150)

  return (
    <div className="my-8 rounded-xl bg-slate-800 p-6">
      <h3 className="mb-4 text-xl font-semibold text-cyan-400">
        Équilibres chimiques - Quotient de réaction
      </h3>

      {/* Zone de visualisation */}
      <div className="mb-6 rounded-lg bg-slate-900 p-4">
        <svg viewBox="0 0 800 400" className="w-full">
          {/* Titre réaction */}
          <text x="400" y="30" fill="#e2e8f0" fontSize="16" textAnchor="middle" fontWeight="bold">
            A + B ⇌ C + D
          </text>

          {/* État initial */}
          <g transform="translate(50, 60)">
            <text x="100" y="0" fill="#94a3b8" fontSize="14" textAnchor="middle">État initial</text>

            {/* Barres réactifs */}
            <g transform="translate(0, 20)">
              <rect x="30" y={150 - barHeight(cA)} width="40" height={barHeight(cA)} fill="#22d3ee" rx="4" />
              <text x="50" y="170" fill="#22d3ee" fontSize="12" textAnchor="middle">[A]</text>
              <text x="50" y="185" fill="#22d3ee" fontSize="10" textAnchor="middle">{cA.toFixed(2)}</text>

              <rect x="80" y={150 - barHeight(cB)} width="40" height={barHeight(cB)} fill="#34d399" rx="4" />
              <text x="100" y="170" fill="#34d399" fontSize="12" textAnchor="middle">[B]</text>
              <text x="100" y="185" fill="#34d399" fontSize="10" textAnchor="middle">{cB.toFixed(2)}</text>
            </g>

            {/* Barres produits */}
            <g transform="translate(100, 20)">
              <rect x="30" y={150 - barHeight(cC)} width="40" height={barHeight(cC)} fill="#fb923c" rx="4" />
              <text x="50" y="170" fill="#fb923c" fontSize="12" textAnchor="middle">[C]</text>
              <text x="50" y="185" fill="#fb923c" fontSize="10" textAnchor="middle">{cC.toFixed(2)}</text>

              <rect x="80" y={150 - barHeight(cD)} width="40" height={barHeight(cD)} fill="#f472b6" rx="4" />
              <text x="100" y="170" fill="#f472b6" fontSize="12" textAnchor="middle">[D]</text>
              <text x="100" y="185" fill="#f472b6" fontSize="10" textAnchor="middle">{cD.toFixed(2)}</text>
            </g>
          </g>

          {/* Flèche évolution */}
          <g transform="translate(320, 150)">
            <defs>
              <marker id="arrowEqui" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                <polygon points="0 0, 10 3.5, 0 7" fill={evolutionSens === 'equilibre' ? '#a78bfa' : evolutionSens === 'direct' ? '#22d3ee' : '#fb923c'} />
              </marker>
            </defs>

            {evolutionSens !== 'equilibre' && (
              <line
                x1="0" y1="0" x2="80" y2="0"
                stroke={evolutionSens === 'direct' ? '#22d3ee' : '#fb923c'}
                strokeWidth="3"
                markerEnd="url(#arrowEqui)"
              />
            )}

            <text x="40" y="-15" fill="#94a3b8" fontSize="12" textAnchor="middle">
              {evolutionSens === 'equilibre' ? '⚖️ Équilibre' : evolutionSens === 'direct' ? 'Sens direct →' : '← Sens inverse'}
            </text>
          </g>

          {/* État final (équilibre) */}
          <g transform="translate(450, 60)">
            <text x="100" y="0" fill="#a78bfa" fontSize="14" textAnchor="middle">État d&apos;équilibre</text>

            {/* Barres réactifs */}
            <g transform="translate(0, 20)">
              <rect x="30" y={150 - barHeight(equilibriumState.cA)} width="40" height={barHeight(equilibriumState.cA)} fill="#22d3ee" rx="4" opacity="0.7" />
              <text x="50" y="170" fill="#22d3ee" fontSize="12" textAnchor="middle">[A]</text>
              <text x="50" y="185" fill="#22d3ee" fontSize="10" textAnchor="middle">{equilibriumState.cA.toFixed(2)}</text>

              <rect x="80" y={150 - barHeight(equilibriumState.cB)} width="40" height={barHeight(equilibriumState.cB)} fill="#34d399" rx="4" opacity="0.7" />
              <text x="100" y="170" fill="#34d399" fontSize="12" textAnchor="middle">[B]</text>
              <text x="100" y="185" fill="#34d399" fontSize="10" textAnchor="middle">{equilibriumState.cB.toFixed(2)}</text>
            </g>

            {/* Barres produits */}
            <g transform="translate(100, 20)">
              <rect x="30" y={150 - barHeight(equilibriumState.cC)} width="40" height={barHeight(equilibriumState.cC)} fill="#fb923c" rx="4" opacity="0.7" />
              <text x="50" y="170" fill="#fb923c" fontSize="12" textAnchor="middle">[C]</text>
              <text x="50" y="185" fill="#fb923c" fontSize="10" textAnchor="middle">{equilibriumState.cC.toFixed(2)}</text>

              <rect x="80" y={150 - barHeight(equilibriumState.cD)} width="40" height={barHeight(equilibriumState.cD)} fill="#f472b6" rx="4" opacity="0.7" />
              <text x="100" y="170" fill="#f472b6" fontSize="12" textAnchor="middle">[D]</text>
              <text x="100" y="185" fill="#f472b6" fontSize="10" textAnchor="middle">{equilibriumState.cD.toFixed(2)}</text>
            </g>
          </g>

          {/* Comparaison Qr et K */}
          <g transform="translate(100, 310)">
            <rect x="0" y="0" width="600" height="70" fill="#1e293b" rx="8" />

            {/* Échelle logarithmique */}
            <line x1="50" y1="35" x2="550" y2="35" stroke="#475569" strokeWidth="2" />

            {/* Graduations */}
            {[-2, -1, 0, 1, 2].map((exp, i) => (
              <g key={i} transform={`translate(${50 + i * 125}, 35)`}>
                <line x1="0" y1="-5" x2="0" y2="5" stroke="#475569" strokeWidth="2" />
                <text x="0" y="20" fill="#64748b" fontSize="10" textAnchor="middle">
                  {exp === 0 ? '1' : `10^${exp}`}
                </text>
              </g>
            ))}

            {/* Position de K */}
            {(() => {
              const logK = Math.log10(Math.max(0.01, Math.min(100, K)))
              const xK = 300 + logK * 125
              return (
                <g transform={`translate(${xK}, 35)`}>
                  <circle r="8" fill="#a78bfa" />
                  <text x="0" y="-15" fill="#a78bfa" fontSize="11" textAnchor="middle">K = {K.toFixed(2)}</text>
                </g>
              )
            })()}

            {/* Position de Qr */}
            {(() => {
              const logQr = Math.log10(Math.max(0.01, Math.min(100, Qr)))
              const xQr = 300 + logQr * 125
              return (
                <g transform={`translate(${xQr}, 35)`}>
                  <polygon points="0,-12 -8,0 8,0" fill="#fbbf24" />
                  <text x="0" y="30" fill="#fbbf24" fontSize="11" textAnchor="middle">Qr = {Qr.toFixed(2)}</text>
                </g>
              )
            })()}

            {/* Labels */}
            <text x="50" y="55" fill="#22d3ee" fontSize="10">Qr &lt; K → sens direct</text>
            <text x="550" y="55" fill="#fb923c" fontSize="10" textAnchor="end">Qr &gt; K → sens inverse</text>
          </g>
        </svg>
      </div>

      {/* Contrôles */}
      <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-5">
        {/* Concentration A */}
        <div className="rounded-lg bg-slate-700/50 p-3">
          <label className="mb-1 flex items-center justify-between text-xs text-slate-300">
            <span>[A] initial</span>
            <span className="text-cyan-400">{cA.toFixed(2)} M</span>
          </label>
          <input
            type="range"
            min="0.1"
            max="2"
            step="0.1"
            value={cA}
            onChange={(e) => setCA(Number(e.target.value))}
            className="w-full accent-cyan-500"
          />
        </div>

        {/* Concentration B */}
        <div className="rounded-lg bg-slate-700/50 p-3">
          <label className="mb-1 flex items-center justify-between text-xs text-slate-300">
            <span>[B] initial</span>
            <span className="text-emerald-400">{cB.toFixed(2)} M</span>
          </label>
          <input
            type="range"
            min="0.1"
            max="2"
            step="0.1"
            value={cB}
            onChange={(e) => setCB(Number(e.target.value))}
            className="w-full accent-emerald-500"
          />
        </div>

        {/* Concentration C */}
        <div className="rounded-lg bg-slate-700/50 p-3">
          <label className="mb-1 flex items-center justify-between text-xs text-slate-300">
            <span>[C] initial</span>
            <span className="text-orange-400">{cC.toFixed(2)} M</span>
          </label>
          <input
            type="range"
            min="0.1"
            max="2"
            step="0.1"
            value={cC}
            onChange={(e) => setCC(Number(e.target.value))}
            className="w-full accent-orange-500"
          />
        </div>

        {/* Concentration D */}
        <div className="rounded-lg bg-slate-700/50 p-3">
          <label className="mb-1 flex items-center justify-between text-xs text-slate-300">
            <span>[D] initial</span>
            <span className="text-pink-400">{cD.toFixed(2)} M</span>
          </label>
          <input
            type="range"
            min="0.1"
            max="2"
            step="0.1"
            value={cD}
            onChange={(e) => setCD(Number(e.target.value))}
            className="w-full accent-pink-500"
          />
        </div>

        {/* Constante K */}
        <div className="rounded-lg bg-slate-700/50 p-3">
          <label className="mb-1 flex items-center justify-between text-xs text-slate-300">
            <span>K</span>
            <span className="text-purple-400">{K.toFixed(2)}</span>
          </label>
          <input
            type="range"
            min="0.1"
            max="10"
            step="0.1"
            value={K}
            onChange={(e) => setK(Number(e.target.value))}
            className="w-full accent-purple-500"
          />
        </div>
      </div>

      {/* Résultats */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <div className="rounded-lg bg-slate-700/50 p-3 text-center">
          <div className="text-xs text-slate-400">Quotient Qr</div>
          <div className={`text-lg font-bold ${Qr < K ? 'text-cyan-400' : Qr > K ? 'text-orange-400' : 'text-purple-400'}`}>
            {Qr.toFixed(3)}
          </div>
        </div>
        <div className="rounded-lg bg-slate-700/50 p-3 text-center">
          <div className="text-xs text-slate-400">Constante K</div>
          <div className="text-lg font-bold text-purple-400">{K.toFixed(3)}</div>
        </div>
        <div className="rounded-lg bg-slate-700/50 p-3 text-center">
          <div className="text-xs text-slate-400">Comparaison</div>
          <div className={`text-lg font-bold ${evolutionSens === 'direct' ? 'text-cyan-400' : evolutionSens === 'inverse' ? 'text-orange-400' : 'text-purple-400'}`}>
            {Qr < K ? 'Qr < K' : Qr > K ? 'Qr > K' : 'Qr = K'}
          </div>
        </div>
        <div className="rounded-lg bg-slate-700/50 p-3 text-center">
          <div className="text-xs text-slate-400">Évolution</div>
          <div className={`text-lg font-bold ${evolutionSens === 'direct' ? 'text-cyan-400' : evolutionSens === 'inverse' ? 'text-orange-400' : 'text-purple-400'}`}>
            {evolutionSens === 'direct' ? '→ Direct' : evolutionSens === 'inverse' ? '← Inverse' : '⚖️ Équilibre'}
          </div>
        </div>
      </div>

      {/* Formules */}
      <div className="mt-6 rounded-lg bg-slate-900/50 p-4">
        <h4 className="mb-3 text-sm font-semibold text-slate-300">Critère d&apos;évolution spontanée</h4>
        <div className="grid grid-cols-1 gap-3 text-sm md:grid-cols-2">
          <div className="rounded bg-slate-800 p-3">
            <div className="mb-1 text-slate-400">Quotient de réaction :</div>
            <div className="font-mono text-cyan-400">Qr = [C]^c·[D]^d / ([A]^a·[B]^b)</div>
          </div>
          <div className="rounded bg-slate-800 p-3">
            <div className="mb-1 text-slate-400">Constante d&apos;équilibre :</div>
            <div className="font-mono text-purple-400">K = Qr,éq (à l&apos;équilibre)</div>
          </div>
          <div className="rounded bg-slate-800 p-3 md:col-span-2">
            <div className="mb-1 text-slate-400">Critère d&apos;évolution :</div>
            <div className="flex flex-wrap gap-4 font-mono">
              <span className="text-cyan-400">Qr &lt; K → sens direct (1)</span>
              <span className="text-orange-400">Qr &gt; K → sens inverse (2)</span>
              <span className="text-purple-400">Qr = K → équilibre</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
