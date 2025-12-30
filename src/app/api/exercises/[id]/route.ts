import { NextRequest, NextResponse } from 'next/server'
import { getExerciseById } from '@/lib/content'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const exercise = getExerciseById(params.id)

  if (!exercise) {
    return NextResponse.json({ error: 'Exercise not found' }, { status: 404 })
  }

  return NextResponse.json(exercise)
}
