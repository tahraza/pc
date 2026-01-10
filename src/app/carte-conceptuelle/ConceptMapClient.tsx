'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Network, ArrowRight, Info, BookOpen } from 'lucide-react'

interface Node {
  id: string
  label: string
  track: 'physique' | 'chimie'
  category: string
}

interface LinkData {
  source: string
  target: string
  label: string
  strength: 'strong' | 'medium' | 'weak'
}

interface Category {
  label: string
  color: string
}

interface ConceptMapData {
  nodes: Node[]
  links: LinkData[]
  categories: Record<string, Category>
}

// Mapping lessonId vers track
const lessonTracks: Record<string, string> = {
  'ondes-mecaniques': 'physique',
  'ondes-lumineuses': 'physique',
  'ondes-sonores': 'physique',
  'diffraction': 'physique',
  'interferences': 'physique',
  'circuit-rc': 'physique',
  'radioactivite': 'physique',
  'energie-mecanique': 'physique',
  'mouvement-circulaire': 'physique',
  'mouvement-newton': 'physique',
  'mouvement-champ-uniforme': 'physique',
  'electromagnetisme': 'physique',
  'thermodynamique': 'physique',
  'travail-force': 'physique',
  'cinetique': 'chimie',
  'acides-bases': 'chimie',
  'titrages': 'chimie',
  'thermochimie': 'chimie',
  'oxydoreduction': 'chimie',
  'piles-electrolyse': 'chimie',
  'spectroscopie-ir': 'chimie',
  'equilibres-chimiques': 'chimie',
}

export default function ConceptMapClient() {
  const [data, setData] = useState<ConceptMapData | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedNode, setSelectedNode] = useState<string | null>(null)
  const [hoveredNode, setHoveredNode] = useState<string | null>(null)
  const [filterCategory, setFilterCategory] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/concept-map')
      .then(res => res.json())
      .then(data => {
        setData(data)
        setLoading(false)
      })
      .catch(err => {
        console.error('Erreur:', err)
        setLoading(false)
      })
  }, [])

  if (loading || !data) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse">
            <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded w-1/3 mb-6"></div>
            <div className="grid grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="h-24 bg-slate-200 dark:bg-slate-800 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Trouver les liens d'un nœud
  const getNodeLinks = (nodeId: string) => {
    return data.links.filter(l => l.source === nodeId || l.target === nodeId)
  }

  // Trouver les nœuds connectés
  const getConnectedNodes = (nodeId: string) => {
    const links = getNodeLinks(nodeId)
    const connected = new Set<string>()
    links.forEach(l => {
      connected.add(l.source)
      connected.add(l.target)
    })
    connected.delete(nodeId)
    return Array.from(connected)
  }

  const activeNode = selectedNode || hoveredNode

  // Filtrer les nœuds par catégorie
  const filteredNodes = filterCategory
    ? data.nodes.filter(n => n.category === filterCategory)
    : data.nodes

  // Grouper par catégorie pour l'affichage
  const nodesByCategory = data.nodes.reduce((acc, node) => {
    if (!acc[node.category]) acc[node.category] = []
    acc[node.category].push(node)
    return acc
  }, {} as Record<string, Node[]>)

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-cyan-600 to-blue-600 dark:from-cyan-900 dark:to-blue-900 py-8 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <Network className="w-8 h-8 text-cyan-100 dark:text-cyan-400" />
            <h1 className="text-3xl font-bold text-white">Carte Conceptuelle</h1>
          </div>
          <p className="text-cyan-100 dark:text-cyan-200">
            Visualise les liens entre les chapitres pour comprendre la cohérence du programme
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6">
        {/* Légende des catégories */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-slate-600 dark:text-slate-400 text-sm mr-2">Filtrer par domaine:</span>
            <button
              onClick={() => setFilterCategory(null)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                filterCategory === null
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                  : 'bg-slate-200 text-slate-700 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600'
              }`}
            >
              Tous
            </button>
            {Object.entries(data.categories).map(([key, cat]) => (
              <button
                key={key}
                onClick={() => setFilterCategory(filterCategory === key ? null : key)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  filterCategory === key
                    ? 'text-white'
                    : 'text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'
                }`}
                style={{
                  backgroundColor: filterCategory === key ? cat.color : 'transparent',
                  borderWidth: 2,
                  borderColor: cat.color
                }}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Info box */}
        <div className="bg-cyan-50 border border-cyan-200 dark:bg-slate-800/50 dark:border-slate-700 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-cyan-600 dark:text-cyan-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-slate-700 dark:text-slate-300">
              <p><strong>Cliquez</strong> sur un chapitre pour voir ses connexions en détail.</p>
              <p className="mt-1">Les liens montrent les <strong>prérequis</strong>, les <strong>applications</strong> et les <strong>concepts partagés</strong> entre chapitres.</p>
            </div>
          </div>
        </div>

        {/* Grille des chapitres par catégorie */}
        <div className="space-y-8">
          {Object.entries(nodesByCategory)
            .filter(([category]) => !filterCategory || category === filterCategory)
            .map(([category, nodes]) => (
              <div key={category}>
                <h2
                  className="text-lg font-semibold mb-3 flex items-center gap-2"
                  style={{ color: data.categories[category]?.color }}
                >
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: data.categories[category]?.color }}
                  ></span>
                  {data.categories[category]?.label}
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {nodes.map(node => {
                    const isActive = activeNode === node.id
                    const isConnected = activeNode ? getConnectedNodes(activeNode).includes(node.id) : false
                    const isDimmed = activeNode && !isActive && !isConnected
                    const nodeLinks = getNodeLinks(node.id)

                    return (
                      <div
                        key={node.id}
                        onClick={() => setSelectedNode(selectedNode === node.id ? null : node.id)}
                        onMouseEnter={() => setHoveredNode(node.id)}
                        onMouseLeave={() => setHoveredNode(null)}
                        className={`relative p-4 rounded-lg border-2 cursor-pointer transition-all ${
                          isActive
                            ? 'ring-2 ring-slate-900 dark:ring-white scale-105 z-10'
                            : isConnected
                            ? 'ring-2 ring-cyan-500 dark:ring-cyan-400'
                            : isDimmed
                            ? 'opacity-30'
                            : 'hover:scale-102'
                        } bg-white dark:bg-slate-800`}
                        style={{
                          borderColor: data.categories[node.category]?.color,
                          backgroundColor: isActive
                            ? data.categories[node.category]?.color + '30'
                            : undefined
                        }}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h3 className="font-medium text-slate-900 dark:text-white text-sm">{node.label}</h3>
                            <span className={`text-xs ${node.track === 'physique' ? 'text-blue-600 dark:text-blue-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                              {node.track === 'physique' ? 'Physique' : 'Chimie'}
                            </span>
                          </div>
                          {nodeLinks.length > 0 && (
                            <span className="text-xs bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded text-slate-600 dark:text-slate-300">
                              {nodeLinks.length}
                            </span>
                          )}
                        </div>

                        {isActive && (
                          <Link
                            href={`/lecons/${lessonTracks[node.id]}/${node.id}`}
                            className="mt-2 flex items-center gap-1 text-xs text-cyan-600 hover:text-cyan-700 dark:text-cyan-400 dark:hover:text-cyan-300"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <BookOpen className="w-3 h-3" />
                            Voir la leçon
                          </Link>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
        </div>

        {/* Panneau de détail des connexions */}
        {selectedNode && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-full max-w-2xl px-4">
            <div className="bg-white border border-slate-200 dark:bg-slate-800 dark:border-slate-600 rounded-xl shadow-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                  Connexions de {data.nodes.find(n => n.id === selectedNode)?.label}
                </h3>
                <button
                  onClick={() => setSelectedNode(null)}
                  className="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-3 max-h-60 overflow-y-auto">
                {getNodeLinks(selectedNode).length === 0 ? (
                  <p className="text-slate-500 dark:text-slate-400 text-sm">Aucune connexion directe répertoriée.</p>
                ) : (
                  getNodeLinks(selectedNode).map((link, idx) => {
                    const otherNodeId = link.source === selectedNode ? link.target : link.source
                    const otherNode = data.nodes.find(n => n.id === otherNodeId)
                    const isOutgoing = link.source === selectedNode

                    return (
                      <div
                        key={idx}
                        className="flex items-center gap-3 p-3 bg-slate-100 dark:bg-slate-700/50 rounded-lg"
                      >
                        <div className={`flex items-center gap-2 ${isOutgoing ? '' : 'flex-row-reverse'}`}>
                          <span className="text-slate-900 dark:text-white font-medium text-sm">
                            {data.nodes.find(n => n.id === selectedNode)?.label}
                          </span>
                          <ArrowRight className={`w-4 h-4 text-cyan-600 dark:text-cyan-400 ${!isOutgoing && 'rotate-180'}`} />
                          <Link
                            href={`/lecons/${lessonTracks[otherNodeId]}/${otherNodeId}`}
                            className="text-cyan-600 hover:text-cyan-700 dark:text-cyan-400 dark:hover:text-cyan-300 font-medium text-sm"
                          >
                            {otherNode?.label}
                          </Link>
                        </div>
                        <span className={`ml-auto text-xs px-2 py-1 rounded ${
                          link.strength === 'strong'
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-400'
                            : link.strength === 'medium'
                            ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-400'
                            : 'bg-slate-200 text-slate-600 dark:bg-slate-600 dark:text-slate-300'
                        }`}>
                          {link.label}
                        </span>
                      </div>
                    )
                  })
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
