'use client'

import { useMemo } from 'react'
import katex from 'katex'

interface LessonContentProps {
  content: string
}

// Process markdown with KaTeX math rendering
function processContent(content: string): string {
  // Process display math blocks ($$...$$)
  let processed = content.replace(/\$\$([\s\S]*?)\$\$/g, (_, math) => {
    try {
      const html = katex.renderToString(math.trim(), {
        displayMode: true,
        throwOnError: false,
      })
      return `<div class="math-block">${html}</div>`
    } catch (e) {
      return `<div class="math-block text-danger-600">[Erreur LaTeX: ${math}]</div>`
    }
  })

  // Process inline math ($...$)
  processed = processed.replace(/\$([^\$\n]+?)\$/g, (_, math) => {
    try {
      const html = katex.renderToString(math.trim(), {
        displayMode: false,
        throwOnError: false,
      })
      return `<span class="math-inline">${html}</span>`
    } catch (e) {
      return `<span class="text-danger-600">[Erreur: ${math}]</span>`
    }
  })

  // Process custom blocks
  // :::definition
  processed = processed.replace(
    /:::definition\s*\n([\s\S]*?):::/g,
    '<div class="definition-box"><strong class="text-primary-700">Définition</strong><div class="mt-2">$1</div></div>'
  )

  // :::theorem
  processed = processed.replace(
    /:::theorem(?:\[([^\]]*)\])?\s*\n([\s\S]*?):::/g,
    (_, title, content) => {
      const titleHtml = title ? `<strong class="text-amber-700">${title}</strong>` : '<strong class="text-amber-700">Théorème</strong>'
      return `<div class="theorem-box">${titleHtml}<div class="mt-2">${content}</div></div>`
    }
  )

  // :::property
  processed = processed.replace(
    /:::property(?:\[([^\]]*)\])?\s*\n([\s\S]*?):::/g,
    (_, title, content) => {
      const titleHtml = title ? `<strong class="text-emerald-700">${title}</strong>` : '<strong class="text-emerald-700">Propriété</strong>'
      return `<div class="property-box">${titleHtml}<div class="mt-2">${content}</div></div>`
    }
  )

  // :::method
  processed = processed.replace(
    /:::method(?:\[([^\]]*)\])?\s*\n([\s\S]*?):::/g,
    (_, title, content) => {
      const titleHtml = title ? `<strong class="text-purple-700">${title}</strong>` : '<strong class="text-purple-700">Méthode</strong>'
      return `<div class="method-box">${titleHtml}<div class="mt-2">${content}</div></div>`
    }
  )

  // :::example
  processed = processed.replace(
    /:::example(?:\[([^\]]*)\])?\s*\n([\s\S]*?):::/g,
    (_, title, content) => {
      const titleHtml = title ? `<strong class="text-slate-700">${title}</strong>` : '<strong class="text-slate-700">Exemple</strong>'
      return `<div class="example-box">${titleHtml}<div class="mt-2">${content}</div></div>`
    }
  )

  // :::warning
  processed = processed.replace(
    /:::warning(?:\[([^\]]*)\])?\s*\n([\s\S]*?):::/g,
    (_, title, content) => {
      const titleHtml = title ? `<strong class="text-danger-700">${title}</strong>` : '<strong class="text-danger-700">Attention</strong>'
      return `<div class="warning-box">${titleHtml}<div class="mt-2">${content}</div></div>`
    }
  )

  // :::tip
  processed = processed.replace(
    /:::tip(?:\[([^\]]*)\])?\s*\n([\s\S]*?):::/g,
    (_, title, content) => {
      const titleHtml = title ? `<strong class="text-success-700">${title}</strong>` : '<strong class="text-success-700">Astuce</strong>'
      return `<div class="tip-box">${titleHtml}<div class="mt-2">${content}</div></div>`
    }
  )

  // Process tables
  // First, ensure content ends with newline for consistent matching
  const contentForTables = processed.endsWith('\n') ? processed : processed + '\n'
  processed = contentForTables.replace(
    /(?:^|\n)((?:\|[^\n]+\|\n)+)/g,
    (match, tableContent) => {
      const rows = tableContent.trim().split('\n').filter((row: string) => row.trim())
      if (rows.length < 2) return match

      // Check if second row is separator (|---|---|)
      const isSeparator = (row: string) => {
        const cleaned = row.replace(/[^|:\-\s]/g, '')
        return /^\|[\s:\-]+(\|[\s:\-]+)+\|$/.test(cleaned) || /^[\s|:\-]+$/.test(cleaned)
      }

      if (!isSeparator(rows[1])) {
        return match
      }

      const parseRow = (row: string): string[] => {
        return row.split('|').slice(1, -1).map((cell: string) => cell.trim())
      }

      const headerCells = parseRow(rows[0])
      const headerHtml = headerCells.map((cell: string) => `<th>${cell}</th>`).join('')

      const bodyRows = rows.slice(2) // Skip header and separator
      const bodyHtml = bodyRows.map((row: string) => {
        const cells = parseRow(row)
        return `<tr>${cells.map((cell: string) => `<td>${cell}</td>`).join('')}</tr>`
      }).join('')

      return `<div class="table-wrapper"><table class="lesson-table"><thead><tr>${headerHtml}</tr></thead><tbody>${bodyHtml}</tbody></table></div>`
    }
  )

  // Process basic markdown
  // Headers
  processed = processed.replace(/^### (.*$)/gm, '<h3>$1</h3>')
  processed = processed.replace(/^## (.*$)/gm, '<h2>$1</h2>')
  processed = processed.replace(/^# (.*$)/gm, '<h1>$1</h1>')

  // Bold and italic
  processed = processed.replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>')
  processed = processed.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
  processed = processed.replace(/\*(.*?)\*/g, '<em>$1</em>')

  // Lists
  processed = processed.replace(/^\s*[-*]\s+(.*)$/gm, '<li>$1</li>')
  processed = processed.replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>')

  // Numbered lists
  processed = processed.replace(/^\d+\.\s+(.*)$/gm, '<li>$1</li>')

  // Paragraphs (simple approach)
  processed = processed.replace(/\n\n+/g, '</p><p>')
  processed = `<p>${processed}</p>`

  // Clean up empty paragraphs
  processed = processed.replace(/<p>\s*<\/p>/g, '')
  processed = processed.replace(/<p>(\s*<(?:h[1-6]|div|ul|ol))/g, '$1')
  processed = processed.replace(/(<\/(?:h[1-6]|div|ul|ol)>\s*)<\/p>/g, '$1')

  return processed
}

export function LessonContent({ content }: LessonContentProps) {
  const processedContent = useMemo(() => processContent(content), [content])

  return (
    <div
      className="lesson-content"
      dangerouslySetInnerHTML={{ __html: processedContent }}
    />
  )
}
