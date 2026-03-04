/**
 * Dify Workflow Client
 * ─────────────────────────────────────────────────────────
 * Optimized for Workflow app type with:
 *   - RAG / Knowledge Retrieval
 *   - Document Processing (upload + index)
 *   - AI Response Generation
 *   - Document deletion for KB cleanup on update (Gap 1 fix)
 */

const DIFY_BASE_URL = process.env.DIFY_BASE_URL || 'https://api.dify.ai/v1'
const DIFY_WORKFLOW_KEY = process.env.DIFY_WORKFLOW_API_KEY || ''
const DIFY_DATASET_KEY = process.env.DIFY_DATASET_API_KEY || DIFY_WORKFLOW_KEY

// ─────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────

export interface WorkflowInputs {
  question: string
  chat_history?: string
  topic_filter?: string
  [key: string]: string | undefined
}

interface DifyWorkflowAPIResponse {
  workflow_run_id: string
  task_id: string
  data: {
    id: string
    workflow_id: string
    status: 'succeeded' | 'failed' | 'stopped'
    outputs: Record<string, unknown>
    error?: string
    elapsed_time: number
    total_tokens: number
    total_steps: number
    created_at: number
    finished_at: number
  }
}

export interface RetrievedChunk {
  id: string
  document_name: string
  segment_position: number
  content: string
  score: number
  word_count: number
  metadata?: {
    type?: 'blog' | 'video' | 'document'
    url?: string
    topic?: string
    date?: string
    duration?: string
    pages?: number
    author?: string
  }
}

export interface WorkflowReference {
  type: 'blog' | 'video' | 'document'
  id: string
  title: string
  url?: string
  meta?: string
  topic?: string
  score?: number
  thumbnail?: string
  subtitle?: string
}

export interface WorkflowResult {
  answer: string
  references: WorkflowReference[]
  retrieval_chunks?: RetrievedChunk[]
  runId: string
  elapsedMs: number
  totalTokens: number
  rawOutputs: Record<string, unknown>
}

// ─────────────────────────────────────────────
// CORE: Run Workflow (blocking)
// ─────────────────────────────────────────────

export async function runWorkflow(
  inputs: WorkflowInputs,
  userId = 'web-user'
): Promise<WorkflowResult> {
  const res = await fetch(`${DIFY_BASE_URL}/workflows/run`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${DIFY_WORKFLOW_KEY}`,
    },
    body: JSON.stringify({
      inputs,
      response_mode: 'blocking',
      user: userId,
    }),
  })

  if (!res.ok) {
    const errText = await res.text()
    throw new DifyWorkflowError(`Workflow run failed [${res.status}]: ${errText}`, res.status)
  }

  const data: DifyWorkflowAPIResponse = await res.json()

  if (data.data.status === 'failed') {
    throw new DifyWorkflowError(
      `Workflow execution failed: ${data.data.error ?? 'Unknown error'}`,
      500
    )
  }

  return parseWorkflowOutputs(data)
}

// ─────────────────────────────────────────────
// STREAMING: Run Workflow with SSE
// ─────────────────────────────────────────────

export async function streamWorkflow(
  inputs: WorkflowInputs,
  userId = 'web-user'
): Promise<ReadableStream<Uint8Array>> {
  const res = await fetch(`${DIFY_BASE_URL}/workflows/run`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${DIFY_WORKFLOW_KEY}`,
    },
    body: JSON.stringify({
      inputs,
      response_mode: 'streaming',
      user: userId,
    }),
  })

  if (!res.ok || !res.body) {
    const errText = await res.text()
    throw new DifyWorkflowError(`Workflow stream failed [${res.status}]: ${errText}`, res.status)
  }

  return res.body
}

// ─────────────────────────────────────────────
// DOCUMENT UPLOAD
// ─────────────────────────────────────────────

export async function uploadDocument(
  file: File,
  datasetId: string,
  options?: {
    chunkMode?: 'automatic' | 'custom'
    maxChunkTokens?: number
    customMetadata?: Record<string, string | number>
  }
): Promise<{ id: string; name: string; status: string; batchId: string }> {
  const formData = new FormData()
  formData.append('file', file)
  formData.append(
    'data',
    JSON.stringify({
      indexing_technique: 'high_quality',
      process_rule:
        options?.chunkMode === 'custom'
          ? {
            mode: 'custom',
            rules: {
              pre_processing_rules: [
                { id: 'remove_extra_spaces', enabled: true },
                { id: 'remove_urls_emails', enabled: false },
              ],
              segmentation: {
                separator: '\n',
                max_tokens: options.maxChunkTokens ?? 500,
              },
            },
          }
          : { mode: 'automatic' },
    })
  )

  const res = await fetch(`${DIFY_BASE_URL}/datasets/${datasetId}/document/create-by-file`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${DIFY_DATASET_KEY}`,
      // Jangan set Content-Type — FormData set sendiri dengan boundary
    },
    body: formData,
  })

  if (!res.ok) {
    const err = await res.text()
    throw new DifyWorkflowError(`Upload failed [${res.status}]: ${err}`, res.status)
  }

  const data = await res.json()
  return {
    id: data.document?.id ?? '',
    name: data.document?.name ?? file.name,
    status: data.document?.indexing_status ?? 'pending',
    batchId: data.batch ?? '',
  }
}

// ─────────────────────────────────────────────
// Gap 1 fix: DELETE DOCUMENT dari Knowledge Base
// ─────────────────────────────────────────────
//
// Dipanggil dari process route sebelum upload versi baru.
// Menghapus dokumen lama supaya Knowledge Base tidak menyimpan
// konten yang sudah outdated, yang bisa bikin chatbot memberikan
// jawaban dari versi lama dan versi baru sekaligus.
//
// datasetId  : DIFY_DATASET_ID dari env
// documentId : kbDocumentId yang tersimpan di topicsStore
//
export async function deleteDocument(
  datasetId: string,
  documentId: string
): Promise<boolean> {
  try {
    const res = await fetch(
      `${DIFY_BASE_URL}/datasets/${datasetId}/documents/${documentId}`,
      {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${DIFY_DATASET_KEY}`,
        },
      }
    )

    // 204 No Content = sukses
    // 404 = dokumen sudah tidak ada, anggap sukses juga
    if (res.status === 204 || res.status === 404) return true

    if (!res.ok) {
      const err = await res.text()
      console.error(`[Dify] deleteDocument failed [${res.status}]: ${err}`)
      return false
    }

    return true
  } catch (err) {
    console.error('[Dify] deleteDocument error:', err)
    return false
  }
}

// ─────────────────────────────────────────────
// INDEXING STATUS
// ─────────────────────────────────────────────

export async function getIndexingStatus(
  datasetId: string,
  batchId: string
): Promise<{ status: string; completed: number; total: number; error?: string }> {
  const res = await fetch(
    `${DIFY_BASE_URL}/datasets/${datasetId}/documents/${batchId}/indexing-status`,
    { headers: { Authorization: `Bearer ${DIFY_DATASET_KEY}` } }
  )

  if (!res.ok) throw new DifyWorkflowError(`Status check failed [${res.status}]`, res.status)

  const data = await res.json()
  const doc = data.data?.[0] ?? {}
  return {
    status: doc.indexing_status ?? 'unknown',
    completed: doc.completed_segments ?? 0,
    total: doc.total_segments ?? 0,
    error: doc.error,
  }
}

// ─────────────────────────────────────────────
// LIST DOCUMENTS
// ─────────────────────────────────────────────

export async function listDocuments(
  datasetId: string,
  page = 1,
  limit = 20
): Promise<{ id: string; name: string; status: string; wordCount: number; createdAt: number }[]> {
  const res = await fetch(
    `${DIFY_BASE_URL}/datasets/${datasetId}/documents?page=${page}&limit=${limit}`,
    { headers: { Authorization: `Bearer ${DIFY_DATASET_KEY}` } }
  )

  if (!res.ok) throw new DifyWorkflowError(`List failed [${res.status}]`, res.status)

  const data = await res.json()
  return (data.data ?? []).map((doc: Record<string, unknown>) => ({
    id: doc.id as string,
    name: doc.name as string,
    status: doc.indexing_status as string,
    wordCount: (doc.word_count as number) ?? 0,
    createdAt: (doc.created_at as number) ?? 0,
  }))
}

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────

function parseWorkflowOutputs(data: DifyWorkflowAPIResponse): WorkflowResult {
  const { workflow_run_id } = data
  const { outputs, elapsed_time, total_tokens } = data.data

  const answer =
    (outputs.answer as string) ??
    (outputs.text as string) ??
    (outputs.result as string) ??
    (outputs.response as string) ??
    ''

  let references: WorkflowReference[] = []
  if (outputs.references) {
    const raw =
      typeof outputs.references === 'string'
        ? safeJsonParse<WorkflowReference[]>(outputs.references, [])
        : (outputs.references as WorkflowReference[])
    references = Array.isArray(raw) ? raw : []
  }

  let retrievalChunks: RetrievedChunk[] | undefined
  if (outputs.retrieval_chunks) {
    const raw =
      typeof outputs.retrieval_chunks === 'string'
        ? safeJsonParse<RetrievedChunk[]>(outputs.retrieval_chunks, [])
        : (outputs.retrieval_chunks as RetrievedChunk[])
    retrievalChunks = Array.isArray(raw) ? raw : undefined

    if (retrievalChunks && references.length === 0) {
      references = synthesizeFromChunks(retrievalChunks)
    }
  }

  return {
    answer,
    references,
    retrieval_chunks: retrievalChunks,
    runId: workflow_run_id,
    elapsedMs: Math.round(elapsed_time * 1000),
    totalTokens: total_tokens ?? 0,
    rawOutputs: outputs,
  }
}

function synthesizeFromChunks(chunks: RetrievedChunk[]): WorkflowReference[] {
  const seen = new Set<string>()
  return chunks
    .filter((c) => {
      if (seen.has(c.document_name)) return false
      seen.add(c.document_name)
      return true
    })
    .map((c) => {
      const meta = c.metadata ?? {}
      const type = meta.type ?? detectType(c.document_name)
      return {
        type,
        id: c.id,
        title: c.document_name.replace(/\.[^.]+$/, ''),
        url: meta.url,
        meta: buildMetaString(type, meta, c),
        topic: meta.topic,
        score: c.score,
      }
    })
}

function detectType(name: string): WorkflowReference['type'] {
  const lower = name.toLowerCase()
  if (lower.includes('video') || /\.(mp4|webm|mov)$/.test(lower)) return 'video'
  if (
    /\.(pdf|docx|xlsx)$/.test(lower) ||
    lower.includes('report') ||
    lower.includes('guide')
  )
    return 'document'
  return 'blog'
}

function buildMetaString(
  type: WorkflowReference['type'],
  meta: RetrievedChunk['metadata'],
  chunk: RetrievedChunk
): string {
  if (type === 'video') return meta?.duration ?? 'Video'
  if (type === 'document')
    return meta?.pages ? `${meta.pages} pages · PDF` : `${chunk.word_count} words`
  return meta?.date ? `Article · ${meta.date}` : 'Article'
}

function safeJsonParse<T>(str: string, fallback: T): T {
  try {
    return JSON.parse(str)
  } catch {
    return fallback
  }
}

export class DifyWorkflowError extends Error {
  constructor(
    message: string,
    public statusCode: number
  ) {
    super(message)
    this.name = 'DifyWorkflowError'
  }
}