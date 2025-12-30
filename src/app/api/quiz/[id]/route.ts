import { NextRequest, NextResponse } from 'next/server'
import { getQuizById } from '@/lib/content'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const quiz = getQuizById(params.id)

  if (!quiz) {
    return NextResponse.json({ error: 'Quiz not found' }, { status: 404 })
  }

  return NextResponse.json(quiz)
}
