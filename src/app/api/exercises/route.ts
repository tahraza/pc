import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function GET() {
  try {
    const exercisesPath = path.join(process.cwd(), 'content', 'exercises.json')
    const exercisesContent = fs.readFileSync(exercisesPath, 'utf-8')
    const exercises = JSON.parse(exercisesContent)

    return NextResponse.json(exercises)
  } catch (error) {
    console.error('Error loading exercises:', error)
    return NextResponse.json([], { status: 500 })
  }
}
