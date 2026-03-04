import { NextRequest, NextResponse } from 'next/server'
import { getIndexingStatus, DifyWorkflowError } from '@/lib/dify-client'

const DATASET_ID = process.env.DIFY_DATASET_ID || ''

// GET /api/documents/status?batchId=xxx
export async function GET(req: NextRequest) {
  const batchId = req.nextUrl.searchParams.get('batchId')
  if (!batchId) return NextResponse.json({ error: 'batchId required' }, { status: 400 })
  if (!DATASET_ID) return NextResponse.json({ error: 'DIFY_DATASET_ID not set' }, { status: 503 })

  try {
    const status = await getIndexingStatus(DATASET_ID, batchId)
    return NextResponse.json(status)
  } catch (err) {
    if (err instanceof DifyWorkflowError) {
      return NextResponse.json({ error: err.message }, { status: err.statusCode })
    }
    return NextResponse.json({ error: 'Status check failed' }, { status: 500 })
  }
}
