'use client'

import { useEffect, useRef } from 'react'
import katex from 'katex'

interface MathTextProps {
  text: string
  className?: string
}

export default function MathText({ text, className = '' }: MathTextProps) {
  const containerRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    if (!containerRef.current) return

    // Process the text to render LaTeX
    let html = text

    // Replace display math ($$...$$)
    html = html.replace(/\$\$([\s\S]*?)\$\$/g, (_, math) => {
      try {
        return katex.renderToString(math.trim(), {
          displayMode: true,
          throwOnError: false,
        })
      } catch {
        return `$$${math}$$`
      }
    })

    // Replace inline math ($...$)
    html = html.replace(/\$([^\$]+?)\$/g, (_, math) => {
      try {
        return katex.renderToString(math.trim(), {
          displayMode: false,
          throwOnError: false,
        })
      } catch {
        return `$${math}$`
      }
    })

    containerRef.current.innerHTML = html
  }, [text])

  return <span ref={containerRef} className={className}>{text}</span>
}
