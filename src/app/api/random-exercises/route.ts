import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), 'content', 'random-exercises.json')
    const fileContents = fs.readFileSync(filePath, 'utf8')
    const templates = JSON.parse(fileContents)
    return NextResponse.json(templates)
  } catch (error) {
    console.error('Erreur lors du chargement des templates:', error)
    return NextResponse.json(
      { error: 'Erreur lors du chargement des templates' },
      { status: 500 }
    )
  }
}
