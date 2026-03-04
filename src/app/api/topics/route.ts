import { NextRequest, NextResponse } from 'next/server'
import { topicsStore } from '@/lib/topics-store'

// GET /api/topics — list all topics
export async function GET() {
  const topics = topicsStore.getAll()
  return NextResponse.json({ topics })
}

// DELETE /api/topics — delete a topic by slug
export async function DELETE(req: NextRequest) {
  const { slug } = await req.json()
  if (!slug) return NextResponse.json({ error: 'slug required' }, { status: 400 })
  const ok = topicsStore.delete(slug)
  if (!ok) return NextResponse.json({ error: 'Topic not found' }, { status: 404 })
  return NextResponse.json({ success: true, slug })
}
