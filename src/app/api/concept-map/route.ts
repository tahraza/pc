import { NextResponse } from 'next/server'
import conceptMap from '@/../../content/concept-map.json'

export async function GET() {
  return NextResponse.json(conceptMap)
}
