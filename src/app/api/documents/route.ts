import { NextRequest, NextResponse } from 'next/server'
import { uploadDocument, listDocuments, getIndexingStatus, DifyWorkflowError } from '@/lib/dify-client'

const DATASET_ID = process.env.DIFY_DATASET_ID || ''

// POST /api/documents — upload a file to Dify Knowledge Base
export async function POST(req: NextRequest) {
  if (!process.env.DIFY_WORKFLOW_API_KEY) {
    return NextResponse.json({ error: 'Dify not configured' }, { status: 503 })
  }
  if (!DATASET_ID) {
    return NextResponse.json(
      { error: 'DIFY_DATASET_ID not set in environment variables' },
      { status: 503 }
    )
  }

  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file type
    const allowed = ['.pdf', '.txt', '.md', '.docx', '.html', '.xlsx', '.csv']
    const ext = '.' + file.name.split('.').pop()?.toLowerCase()
    if (!allowed.includes(ext)) {
      return NextResponse.json(
        { error: `Unsupported file type. Allowed: ${allowed.join(', ')}` },
        { status: 400 }
      )
    }

    // Validate file size (max 15MB)
    if (file.size > 15 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large (max 15MB)' }, { status: 400 })
    }

    const result = await uploadDocument(file, DATASET_ID, {
      chunkMode: 'automatic',
    })

    return NextResponse.json({
      success: true,
      document: result,
      message: `"${result.name}" uploaded successfully. Indexing in progress...`,
    })
  } catch (err) {
    if (err instanceof DifyWorkflowError) {
      return NextResponse.json({ error: err.message }, { status: err.statusCode })
    }
    console.error('[Documents] Upload error:', err)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}

// GET /api/documents — list all indexed documents
export async function GET() {
  if (!process.env.DIFY_WORKFLOW_API_KEY || !DATASET_ID) {
    return NextResponse.json({ documents: [] })
  }

  try {
    const docs = await listDocuments(DATASET_ID)
    return NextResponse.json({ documents: docs })
  } catch (err) {
    console.error('[Documents] List error:', err)
    return NextResponse.json({ documents: [], error: 'Failed to list documents' })
  }
}
