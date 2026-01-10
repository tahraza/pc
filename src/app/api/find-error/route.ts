import { NextResponse } from 'next/server'
import exercises from '@/../../content/find-error-exercises.json'

export async function GET() {
  return NextResponse.json(exercises)
}
