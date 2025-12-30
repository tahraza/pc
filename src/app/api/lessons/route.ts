import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

export async function GET() {
  try {
    const lessons: { id: string; title: string; track: string }[] = []
    const lessonsDir = path.join(process.cwd(), 'content', 'lessons')

    // Read spe lessons
    const speDir = path.join(lessonsDir, 'spe')
    if (fs.existsSync(speDir)) {
      const speFiles = fs.readdirSync(speDir).filter(f => f.endsWith('.mdx'))
      for (const file of speFiles) {
        const content = fs.readFileSync(path.join(speDir, file), 'utf-8')
        const { data } = matter(content)
        lessons.push({
          id: data.id || file.replace('.mdx', ''),
          title: data.title || file.replace('.mdx', ''),
          track: 'spe'
        })
      }
    }

    // Read expertes lessons
    const expertesDir = path.join(lessonsDir, 'expertes')
    if (fs.existsSync(expertesDir)) {
      const expertesFiles = fs.readdirSync(expertesDir).filter(f => f.endsWith('.mdx'))
      for (const file of expertesFiles) {
        const content = fs.readFileSync(path.join(expertesDir, file), 'utf-8')
        const { data } = matter(content)
        lessons.push({
          id: data.id || file.replace('.mdx', ''),
          title: data.title || file.replace('.mdx', ''),
          track: 'expertes'
        })
      }
    }

    return NextResponse.json(lessons)
  } catch (error) {
    console.error('Error loading lessons:', error)
    return NextResponse.json([], { status: 500 })
  }
}
