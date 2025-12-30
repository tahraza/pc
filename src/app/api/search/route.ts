import { NextRequest, NextResponse } from 'next/server'
import Fuse from 'fuse.js'
import { getSearchIndex, type SearchableItem } from '@/lib/content'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const query = searchParams.get('q')

  if (!query || query.length < 2) {
    return NextResponse.json({ results: [] })
  }

  const searchIndex = getSearchIndex()

  const fuse = new Fuse(searchIndex, {
    keys: [
      { name: 'title', weight: 2 },
      { name: 'content', weight: 1 },
    ],
    threshold: 0.4,
    includeScore: true,
    minMatchCharLength: 2,
  })

  const results = fuse.search(query, { limit: 10 })

  const formattedResults = results.map((result) => ({
    id: result.item.id,
    title: result.item.title,
    type: result.item.type,
    track: result.item.track,
    url: result.item.url,
    excerpt: result.item.content.slice(0, 150) + '...',
    score: result.score,
  }))

  return NextResponse.json({ results: formattedResults })
}
