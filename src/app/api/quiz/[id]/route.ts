import { NextRequest, NextResponse } from 'next/server'
import { getQuizById, getLessonById } from '@/lib/content'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const quiz = getQuizById(params.id)

  if (!quiz) {
    return NextResponse.json({ error: 'Quiz not found' }, { status: 404 })
  }

  // Get the lesson to include the track for proper URL construction
  const lesson = getLessonById(quiz.lessonId)
  const track = lesson?.track || 'physique'

  return NextResponse.json({ ...quiz, track })
}
