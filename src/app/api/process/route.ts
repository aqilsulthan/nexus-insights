import { NextRequest, NextResponse } from 'next/server'
import { uploadDocument, deleteDocument, DifyWorkflowError } from '@/lib/dify-client'
import { topicsStore } from '@/lib/topics-store'

const DIFY_BASE_URL = process.env.DIFY_BASE_URL || 'https://api.dify.ai/v1'
const AGENT_KEY = process.env.DIFY_AGENT_API_KEY || ''
const DATASET_ID = process.env.DIFY_DATASET_ID || ''

export const maxDuration = 120

export async function POST(req: NextRequest) {
  if (!AGENT_KEY) {
    return NextResponse.json(
      { error: 'DIFY_AGENT_API_KEY not configured. See .env.example.' },
      { status: 503 }
    )
  }

  let file: File | null = null
  let authorName = ''
  let authorRole = ''
  let category = ''

  try {
    const formData = await req.formData()
    file = formData.get('file') as File | null
    authorName = (formData.get('author_name') as string) || 'Insights Editorial'
    authorRole = (formData.get('author_role') as string) || 'Research Team'
    category = (formData.get('category') as string) || ''
  } catch {
    return NextResponse.json({ error: 'Invalid form data' }, { status: 400 })
  }

  if (!file) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 })
  }

  const allowedExts = ['.pdf', '.txt', '.md', '.docx', '.html', '.srt', '.vtt', '.csv']
  const ext = '.' + file.name.split('.').pop()?.toLowerCase()
  if (!allowedExts.includes(ext)) {
    return NextResponse.json(
      { error: `Unsupported file type. Allowed: ${allowedExts.join(', ')}` },
      { status: 400 }
    )
  }
  if (file.size > 15 * 1024 * 1024) {
    return NextResponse.json({ error: 'File too large (max 15MB)' }, { status: 400 })
  }

  // ── Ambil semua topic yang ada ──────────────────────────────
  const existingTopics = topicsStore.getAll()
  const existingSlugsJson = JSON.stringify(existingTopics.map((t) => t.slug))

  // ── Call Dify Knowledge Agent ───────────────────────────────
  let agentResult: {
    success: boolean
    error?: string
    article?: string
    kb_text?: string
    action?: string
    slug?: string
    title?: string
    version?: string
  }

  try {
    const fileBytes = await file.arrayBuffer()
    const base64 = Buffer.from(fileBytes).toString('base64')

    // Upload file ke Dify Files API untuk mendapat file_id
    const uploadFormData = new FormData()
    uploadFormData.append('file', file)
    uploadFormData.append('user', 'admin')

    const fileUploadRes = await fetch(`${DIFY_BASE_URL}/files/upload`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${AGENT_KEY}` },
      body: uploadFormData,
    })

    let difyFileId: string | null = null
    if (fileUploadRes.ok) {
      const fileData = await fileUploadRes.json()
      difyFileId = fileData.id
    }

    // ── Gap 2 fix: kirim konten artikel lama ke agent ──────────
    // Agent Update Generator akan pakai ini sebagai konteks versi sebelumnya
    // sehingga update lebih koheren dan tidak mengulang hal yang sudah ada
    //
    // Kita tidak tahu slug mana yang akan di-update sebelum agent jalan,
    // jadi kita kirim semua excerpt dari semua artikel yang ada.
    // Agent bisa pilih sendiri mana yang relevan.
    const existingContentsJson = JSON.stringify(
      existingTopics.map((t) => ({
        slug: t.slug,
        title: t.title,
        excerpt: t.excerpt,
        version: t.version,
        // Kirim 500 karakter pertama content sebagai konteks ringkas
        // Tidak kirim full HTML untuk efisiensi token
        content_preview: t.content.replace(/<[^>]+>/g, ' ').slice(0, 500).trim(),
      }))
    )

    const workflowInputs: Record<string, unknown> = {
      file_name: file.name,
      author_name: authorName,
      author_role: authorRole,
      category: category,
      existing_slugs_json: existingSlugsJson,
      // Gap 2 fix: tambahan input — konten artikel lama
      existing_contents_json: existingContentsJson,
    }

    if (difyFileId) {
      workflowInputs.uploaded_file = {
        transfer_method: 'local_file',
        upload_file_id: difyFileId,
        type: 'document',
      }
    } else {
      // Fallback untuk file teks kecil
      workflowInputs.uploaded_file = base64
    }

    const workflowRes = await fetch(`${DIFY_BASE_URL}/workflows/run`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${AGENT_KEY}`,
      },
      body: JSON.stringify({
        inputs: workflowInputs,
        response_mode: 'blocking',
        user: 'admin',
      }),
    })

    if (!workflowRes.ok) {
      const errText = await workflowRes.text()
      throw new Error(`Agent workflow failed [${workflowRes.status}]: ${errText}`)
    }

    const workflowData = await workflowRes.json()

    if (workflowData.data?.status === 'failed') {
      throw new Error(`Agent execution failed: ${workflowData.data?.error ?? 'Unknown'}`)
    }

    const outputs = workflowData.data?.outputs ?? {}
    agentResult = {
      success: outputs.success === true || outputs.success === 'true',
      error: outputs.error || undefined,
      article: outputs.article,
      kb_text: outputs.kb_text,
      action: outputs.action,
      slug: outputs.slug,
      title: outputs.title,
      version: outputs.version,
    }
  } catch (err) {
    console.error('[Process] Agent error:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Agent processing failed' },
      { status: 500 }
    )
  }

  if (!agentResult.success || !agentResult.article) {
    return NextResponse.json(
      { error: agentResult.error || 'Agent returned empty result' },
      { status: 500 }
    )
  }

  // ── Parse article JSON dari agent ───────────────────────────
  let article: Record<string, unknown>
  try {
    article = JSON.parse(agentResult.article)
  } catch {
    return NextResponse.json(
      { error: 'Agent returned malformed article JSON' },
      { status: 500 }
    )
  }

  const isUpdate = agentResult.action === 'update'
  const slug = article.slug as string

  // ── Gap 1 fix: hapus dokumen KB lama sebelum upload baru ────
  // Ini mencegah chatbot mengambil chunk dari versi lama dan versi baru sekaligus
  if (isUpdate && DATASET_ID) {
    const existingTopic = topicsStore.getBySlug(slug)
    if (existingTopic?.kbDocumentId) {
      console.log(`[Process] Deleting old KB document: ${existingTopic.kbDocumentId}`)
      const deleted = await deleteDocument(DATASET_ID, existingTopic.kbDocumentId)
      if (deleted) {
        console.log(`[Process] Old KB document deleted successfully`)
      } else {
        // Tidak fatal — lanjut saja, tapi log supaya bisa dicek
        console.warn(`[Process] Failed to delete old KB document, continuing anyway`)
      }
    }
  }

  // ── Upsert artikel ke topics store ─────────────────────────
  const topicPayload = {
    id: slug,
    slug,
    title: article.title as string,
    subtitle: article.subtitle as string,
    category: article.category as string,
    excerpt: article.excerpt as string,
    content: article.content_html as string,
    author: article.author as string,
    authorRole: article.author_role as string,
    heroColor: article.hero_color as string,
    readTime: article.read_time as string,
    tags: (article.tags as string[]) || [],
    stats: (article.stats as { number: string; label: string }[]) || [],
    date: new Date().toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    }),
    version: agentResult.version || '1.0',
    versionNotes: article.version_notes as string | null,
    sourceFile: file.name,
    // kbDocumentId diset null dulu, diisi setelah upload KB sukses di bawah
    kbDocumentId: null,
  }

  if (isUpdate) {
    topicsStore.update(slug, topicPayload)
  } else {
    topicsStore.create(topicPayload)
  }

  // ── Upload kb_text baru ke Dify Knowledge Base ──────────────
  let kbDocumentId: string | null = null
  if (agentResult.kb_text && DATASET_ID) {
    try {
      const kbBlob = new Blob(
        [`Title: ${article.title}\nSlug: ${slug}\n\n${agentResult.kb_text}`],
        { type: 'text/plain' }
      )
      const kbFile = new File([kbBlob], `${slug}.txt`, { type: 'text/plain' })

      const kbResult = await uploadDocument(kbFile, DATASET_ID, {
        chunkMode: 'automatic',
      })

      kbDocumentId = kbResult.id

      // Gap 1 fix: simpan document ID baru ke topics store
      // Dipakai untuk hapus saat artikel ini di-update lagi nanti
      if (kbDocumentId) {
        topicsStore.setKbDocumentId(slug, kbDocumentId)
      }
    } catch (err) {
      // KB indexing gagal tidak batalkan keseluruhan — artikel tetap tersimpan
      console.error('[Process] KB indexing failed (non-fatal):', err)
    }
  }

  return NextResponse.json({
    success: true,
    action: agentResult.action,
    slug,
    title: agentResult.title,
    version: agentResult.version,
    article: topicPayload,
    kb_indexed: !!kbDocumentId,
    kb_document_id: kbDocumentId,
    message: isUpdate
      ? `"${agentResult.title}" updated to version ${agentResult.version}`
      : `"${agentResult.title}" published as a new topic`,
  })
}
