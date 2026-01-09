'use client'

import { useEffect, useRef } from 'react'
import katex from 'katex'

interface SvgMathProps {
  tex: string
  x: number
  y: number
  fontSize?: number
  color?: string
  displayMode?: boolean
  className?: string
}

/**
 * Composant pour afficher des formules LaTeX dans un SVG
 * Utilise foreignObject pour intégrer le rendu KaTeX
 */
export function SvgMath({
  tex,
  x,
  y,
  fontSize = 14,
  color = '#e2e8f0',
  displayMode = false,
  className = ''
}: SvgMathProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (ref.current) {
      try {
        katex.render(tex, ref.current, {
          displayMode,
          throwOnError: false,
          output: 'html',
        })
      } catch (e) {
        ref.current.textContent = tex
      }
    }
  }, [tex, displayMode])

  // Estimation de la largeur/hauteur pour foreignObject
  const width = tex.length * fontSize * 0.7 + 40
  const height = displayMode ? fontSize * 3 : fontSize * 2

  return (
    <foreignObject
      x={x}
      y={y - height / 2}
      width={width}
      height={height}
      className={className}
    >
      <div
        ref={ref}
        style={{
          color,
          fontSize: `${fontSize}px`,
          fontFamily: 'KaTeX_Math, Times New Roman, serif',
          whiteSpace: 'nowrap',
        }}
      />
    </foreignObject>
  )
}

interface MathBlockProps {
  children: string
  className?: string
}

/**
 * Composant pour afficher des formules LaTeX en bloc (hors SVG)
 */
export function MathBlock({ children, className = '' }: MathBlockProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (ref.current) {
      try {
        katex.render(children, ref.current, {
          displayMode: true,
          throwOnError: false,
        })
      } catch (e) {
        ref.current.textContent = children
      }
    }
  }, [children])

  return <div ref={ref} className={className} />
}

/**
 * Composant pour afficher des formules LaTeX en ligne (hors SVG)
 */
export function MathInline({ children, className = '' }: MathBlockProps) {
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    if (ref.current) {
      try {
        katex.render(children, ref.current, {
          displayMode: false,
          throwOnError: false,
        })
      } catch (e) {
        ref.current.textContent = children
      }
    }
  }, [children])

  return <span ref={ref} className={className} />
}
