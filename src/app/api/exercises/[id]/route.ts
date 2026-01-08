import { NextRequest, NextResponse } from 'next/server'
import { getExerciseById, getLessonById } from '@/lib/content'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const exercise = getExerciseById(params.id)

  if (!exercise) {
    return NextResponse.json({ error: 'Exercise not found' }, { status: 404 })
  }

  // Get lesson info to build the correct URL
  const lesson = getLessonById(exercise.lessonId)
  const lessonUrl = lesson ? `/lecons/${lesson.track}/${lesson.slug}` : null

  return NextResponse.json({
    ...exercise,
    lessonUrl,
  })
}
