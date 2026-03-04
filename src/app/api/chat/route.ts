import { NextRequest, NextResponse } from 'next/server'
import { runWorkflow, DifyWorkflowError, WorkflowReference } from '@/lib/dify-client'
import { findReferences } from '@/lib/knowledge-base'
import { Reference } from '@/types'

export const runtime = 'nodejs'
export const maxDuration = 60 // seconds — Dify RAG can take time for large docs

export async function POST(req: NextRequest) {
  const { messages, question } = await req.json()
  const currentQuestion: string = question || messages?.at(-1)?.content || ''

  if (!currentQuestion.trim()) {
    return NextResponse.json({ error: 'Question is required' }, { status: 400 })
  }

  // ─────────────────────────────────────────────────────────
  // Build chat_history string from previous messages so the
  // Dify LLM node has conversational context across turns.
  // This is injected into your workflow's {{chat_history}} variable.
  // ─────────────────────────────────────────────────────────
  const chatHistory = (messages as { role: string; content: string }[])
    .slice(0, -1) // exclude the current question
    .slice(-6)    // last 3 turns (6 messages) to stay within token limits
    .map((m) => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`)
    .join('\n')

  // ─────────────────────────────────────────────────────────
  // PATH A: Dify Workflow (primary)
  // ─────────────────────────────────────────────────────────
  if (process.env.DIFY_WORKFLOW_API_KEY) {
    try {
      const result = await runWorkflow(
        {
          question: currentQuestion,
          chat_history: chatHistory || undefined,
          // Optional: pass topic filter to scope Knowledge Retrieval
          // topic_filter: detectTopic(currentQuestion),
        },
        'web-user'
      )

      // Map Dify WorkflowReferences → our frontend Reference type
      const difyRefs: Reference[] = result.references.map((r: WorkflowReference) => ({
        type: r.type,
        id: r.id,
        title: r.title,
        subtitle: r.subtitle ?? (r.type === 'document' ? 'Document' : r.type === 'video' ? 'Video' : 'Article'),
        url: r.url,
        meta: r.meta,
        topic: r.topic,
        thumbnail: r.thumbnail,
      }))

      // If Dify returned no references, enrich with local knowledge base matches
      const finalRefs = difyRefs.length > 0 ? difyRefs : buildLocalRefs(currentQuestion)

      // Strip trailing disclaimer if Dify LLM already added it
      const disclaimerMatch = result.answer.match(/DISCLAIMER:.*$/m)
      const disclaimer = disclaimerMatch
        ? disclaimerMatch[0]
        : 'DISCLAIMER: This information is based solely on published insights cited. Verify with the primary sources.'
      const cleanAnswer = result.answer.replace(/DISCLAIMER:.*$/m, '').trim()

      return NextResponse.json({
        content: cleanAnswer,
        references: finalRefs,
        disclaimer,
        source: 'dify-workflow',
        meta: {
          runId: result.runId,
          elapsedMs: result.elapsedMs,
          totalTokens: result.totalTokens,
        },
      })
    } catch (err) {
      if (err instanceof DifyWorkflowError) {
        console.error(`[Dify] Workflow error ${err.statusCode}:`, err.message)
        if (err.statusCode === 401 || err.statusCode === 403) {
          return NextResponse.json(
            { error: 'Dify API key is invalid. Check DIFY_WORKFLOW_API_KEY.' },
            { status: 401 }
          )
        }
      } else {
        console.error('[Dify] Unexpected error:', err)
      }
      return NextResponse.json(
        { error: 'An unexpected error occurred while communicating with the Dify workflow endpoint.' },
        { status: 500 }
      )
    }
  } else {
    return NextResponse.json(
      { error: 'Dify workflow is not configured. Please set DIFY_WORKFLOW_API_KEY in your environment variables.' },
      { status: 503 }
    )
  }
}

// ─────────────────────────────────────────────
// Helper: build local reference cards from knowledge base
// ─────────────────────────────────────────────
function buildLocalRefs(question: string): Reference[] {
  const { blogs, videos: vids, documents: docs } = findReferences(question)
  return [
    ...blogs.map((a) => ({
      type: 'blog' as const,
      id: a.id,
      title: a.title,
      subtitle: a.category,
      url: `/blog/${a.slug}`,
      meta: a.readTime,
      topic: a.category,
    })),
    ...vids.map((v) => ({
      type: 'video' as const,
      id: v.id,
      title: v.title,
      thumbnail: v.thumbnail,
      url: v.url,
      meta: v.duration,
      topic: v.topic,
    })),
    ...docs.map((d) => ({
      type: 'document' as const,
      id: d.id,
      title: d.title,
      subtitle: d.type,
      url: d.url,
      meta: `${d.pages} pages · ${d.type}`,
      topic: d.topic,
    })),
  ]
}
