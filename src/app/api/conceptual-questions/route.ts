import { NextResponse } from 'next/server'
import questions from '@/../../content/conceptual-questions.json'

export async function GET() {
  return NextResponse.json(questions)
}
