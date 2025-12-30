import { NextRequest, NextResponse } from 'next/server'
import { getAllFlashcards, getFlashcardsByLesson } from '@/lib/content'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const lessonId = searchParams.get('lesson')

  const flashcards = lessonId
    ? getFlashcardsByLesson(lessonId)
    : getAllFlashcards()

  return NextResponse.json(flashcards)
}
