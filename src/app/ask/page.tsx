'use client'
import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, Send, Plus, ThumbsUp, ThumbsDown, Copy, AlertCircle, Loader2, Sparkles } from 'lucide-react'
import { ChatMessage, Reference } from '@/types'
import ReferenceCard from '@/components/ReferenceCard'
import DocumentUploadPanel from '@/components/DocumentUploadPanel'
import { trendingQuestions } from '@/lib/knowledge-base'

function parseMarkdown(text: string): string {
  return text
    .replace(/^## (.+)$/gm, '<h3 class="text-base font-bold text-gray-900 mt-5 mb-2">$1</h3>')
    .replace(/^### (.+)$/gm, '<h4 class="text-sm font-bold text-gray-800 mt-3 mb-1.5">$1</h4>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/^\- (.+)$/gm, '<li class="ml-4 pl-3 border-l-2 border-brand-blue mb-1.5 text-sm text-gray-700">$1</li>')
    .replace(/\[(\d+)\]/g, '<sup class="text-brand-blue font-bold cursor-pointer text-xs">[$1]</sup>')
    .replace(/\n\n/g, '</p><p class="text-sm text-gray-700 leading-relaxed mb-3">')
    .replace(/^(.+)$(?!<)/gm, (match) => {
      if (match.startsWith('<')) return match
      return `<p class="text-sm text-gray-700 leading-relaxed mb-3">${match}</p>`
    })
}

export default function AskPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [activeChat, setActiveChat] = useState<string | null>(null)
  // Dify Chatflow: persist conversation ID across turns for managed memory
  const [difyConversationId, setDifyConversationId] = useState<string | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const handleSend = async (question?: string) => {
    const q = question ?? input.trim()
    if (!q || loading) return

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: q,
    }
    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setLoading(true)

    const allMessages = [...messages, userMsg].map((m) => ({
      role: m.role,
      content: m.content,
    }))

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: allMessages,
          question: q,
          conversationId: difyConversationId, // enables Dify Chatflow memory
        }),
      })
      const data = await res.json()

      // Persist Dify conversationId for subsequent turns
      if (data.conversationId) setDifyConversationId(data.conversationId)

      const assistantMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.content,
        references: data.references,
        disclaimer: data.disclaimer,
      }
      setMessages((prev) => [...prev, assistantMsg])
    } catch {
      const errMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
      }
      setMessages((prev) => [...prev, errMsg])
    } finally {
      setLoading(false)
      inputRef.current?.focus()
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const startNewChat = () => {
    setMessages([])
    setInput('')
    setActiveChat(null)
    setDifyConversationId(null) // Reset Dify conversation
  }

  const groupedRefs = (refs: Reference[]) => ({
    blogs: refs.filter((r) => r.type === 'blog'),
    videos: refs.filter((r) => r.type === 'video'),
    documents: refs.filter((r) => r.type === 'document'),
  })

  return (
    <div className="flex h-screen bg-white overflow-hidden">
      {/* Sidebar */}
      <aside className="w-56 bg-gray-950 flex flex-col shrink-0 hidden md:flex">
        <div className="p-5 border-b border-gray-800">
          <Link href="/" className="flex items-center gap-2 mb-5">
            <ArrowLeft size={14} className="text-gray-500" />
            <span className="text-gray-400 text-xs">Back to Insights</span>
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-brand-blue flex items-center justify-center">
              <Sparkles size={12} className="text-white" />
            </div>
            <div>
              <div className="text-white font-bold text-sm" style={{ fontFamily: 'Playfair Display, serif' }}>
                Ask Insights
              </div>
              <div className="text-gray-500 text-xs">BETA</div>
            </div>
          </div>
        </div>

        <div className="p-4">
          <button
            onClick={startNewChat}
            className="w-full flex items-center gap-2 text-gray-400 hover:text-white text-sm py-2 px-3 border border-gray-700 hover:border-gray-500 transition-colors"
          >
            <Plus size={14} />
            New Chat
          </button>
        </div>

        {messages.length > 0 && (
          <div className="px-4 py-2">
            <div className="text-xs text-gray-600 uppercase tracking-widest mb-2">Current</div>
            <div className="text-xs text-gray-400 truncate py-1 px-2 bg-gray-800 rounded">
              {messages[0]?.content.slice(0, 40)}...
            </div>
          </div>
        )}

        <div className="mt-auto">
          <DocumentUploadPanel />
          <div className="p-4 border-t border-gray-800">
            <p className="text-xs text-gray-600 leading-relaxed">
              Responses are based only on published insights and should be verified with cited sources.
            </p>
          </div>
        </div>
      </aside>

      {/* Main chat area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Chat header */}
        <div className="h-12 border-b border-gray-200 flex items-center px-6 shrink-0 md:hidden">
          <Link href="/" className="flex items-center gap-2 text-sm text-gray-500">
            <ArrowLeft size={14} />
            Back
          </Link>
          <div className="flex items-center gap-2 mx-auto">
            <Sparkles size={14} className="text-brand-blue" />
            <span className="font-bold text-sm" style={{ fontFamily: 'Playfair Display, serif' }}>Ask Insights</span>
            <span className="text-xs bg-brand-blue text-white px-1.5 py-0.5">BETA</span>
          </div>
        </div>

        {/* Scroll area */}
        <div className="flex-1 overflow-y-auto">
          {messages.length === 0 ? (
            /* Empty state */
            <div className="max-w-2xl mx-auto px-6 py-16">
              <div className="text-center mb-12">
                <div className="inline-flex items-center justify-center w-14 h-14 bg-brand-blue mb-6">
                  <Sparkles size={24} className="text-white" />
                </div>
                <h1
                  className="text-3xl text-gray-900 mb-3"
                  style={{ fontFamily: 'Playfair Display, Georgia, serif', fontWeight: 400 }}
                >
                  Ask Insights
                </h1>
                <p className="text-gray-500 text-base leading-relaxed">
                  A research assistant powered by published insights on AI, leadership, strategy, and digital transformation.
                </p>
              </div>

              <div className="mb-4">
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-px flex-1 bg-gray-200" />
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Trending Questions</span>
                  <div className="h-px flex-1 bg-gray-200" />
                </div>
                <div className="grid grid-cols-1 gap-2.5">
                  {trendingQuestions.map((q) => (
                    <button
                      key={q}
                      onClick={() => handleSend(q)}
                      className="trend-card text-left p-4 rounded-none text-sm text-gray-700 font-medium"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto px-6 py-8 space-y-8">
              {messages.map((msg) => (
                <div key={msg.id} className="fade-in-up">
                  {msg.role === 'user' ? (
                    /* User bubble */
                    <div className="flex justify-end">
                      <div className="flex items-start gap-3 max-w-lg">
                        <div className="bg-gray-100 text-gray-900 text-sm px-5 py-3 rounded-none font-medium leading-relaxed">
                          {msg.content}
                        </div>
                        <div className="w-8 h-8 bg-gray-900 flex items-center justify-center shrink-0">
                          <span className="text-white text-xs font-bold">U</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Assistant response */
                    <div>
                      {/* Disclaimer banner */}
                      <div className="flex items-start gap-2 bg-blue-50 border border-blue-100 px-4 py-3 mb-5 text-xs text-blue-700">
                        <AlertCircle size={13} className="shrink-0 mt-0.5 text-blue-500" />
                        <span>This response is based solely on published insights cited below. Verify with primary sources.</span>
                      </div>

                      {/* Response content */}
                      <div
                        className="text-gray-700 leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: parseMarkdown(msg.content) }}
                      />

                      {/* References */}
                      {msg.references && msg.references.length > 0 && (
                        <div className="mt-8">
                          <div className="flex items-center gap-2 mb-4">
                            <div className="h-px flex-1 bg-gray-200" />
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                              <span className="w-3 h-3 bg-brand-blue inline-block" />
                              References
                            </span>
                            <div className="h-px flex-1 bg-gray-200" />
                          </div>

                          {/* Group references by type */}
                          {(() => {
                            const { blogs, videos, documents } = groupedRefs(msg.references!)
                            return (
                              <div className="space-y-5">
                                {/* Articles */}
                                {blogs.length > 0 && (
                                  <div>
                                    <div className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                      <span className="w-2 h-2 bg-brand-blue inline-block" />
                                      Articles
                                    </div>
                                    <div className="flex gap-3 overflow-x-auto pb-2">
                                      {blogs.map((r) => (
                                        <ReferenceCard key={r.id} reference={r} />
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {/* Videos */}
                                {videos.length > 0 && (
                                  <div>
                                    <div className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                      <span className="w-2 h-2 bg-red-500 inline-block" />
                                      Videos
                                    </div>
                                    <div className="flex gap-3 overflow-x-auto pb-2">
                                      {videos.map((r) => (
                                        <ReferenceCard key={r.id} reference={r} />
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {/* Documents */}
                                {documents.length > 0 && (
                                  <div>
                                    <div className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                      <span className="w-2 h-2 bg-green-500 inline-block" />
                                      Documents & Reports
                                    </div>
                                    <div className="flex gap-3 overflow-x-auto pb-2">
                                      {documents.map((r) => (
                                        <ReferenceCard key={r.id} reference={r} />
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            )
                          })()}
                        </div>
                      )}

                      {/* Feedback row */}
                      <div className="flex items-center gap-3 mt-5 pt-4 border-t border-gray-100">
                        <span className="text-xs text-gray-400">Was this helpful?</span>
                        <button className="p-1.5 hover:bg-gray-100 rounded transition-colors">
                          <ThumbsUp size={14} className="text-gray-400" />
                        </button>
                        <button className="p-1.5 hover:bg-gray-100 rounded transition-colors">
                          <ThumbsDown size={14} className="text-gray-400" />
                        </button>
                        <div className="h-4 w-px bg-gray-200" />
                        <button
                          className="p-1.5 hover:bg-gray-100 rounded transition-colors"
                          onClick={() => navigator.clipboard.writeText(msg.content)}
                        >
                          <Copy size={14} className="text-gray-400" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {/* Loading state */}
              {loading && (
                <div className="fade-in-up">
                  <div className="bg-blue-50 border border-blue-100 px-4 py-3 mb-5 text-xs text-blue-700 flex items-center gap-2">
                    <Loader2 size={13} className="animate-spin text-blue-500" />
                    Searching published insights...
                  </div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-100 animate-pulse w-3/4" />
                    <div className="h-4 bg-gray-100 animate-pulse w-full" />
                    <div className="h-4 bg-gray-100 animate-pulse w-5/6" />
                    <div className="h-4 bg-gray-100 animate-pulse w-2/3" />
                  </div>
                </div>
              )}

              <div ref={bottomRef} />
            </div>
          )}
        </div>

        {/* Input area */}
        <div className="border-t border-gray-200 bg-white p-4 shrink-0">
          <div className="max-w-3xl mx-auto">
            <div className="flex gap-3 items-end border border-gray-300 focus-within:border-brand-blue transition-colors p-3">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={messages.length === 0 ? "Ask about our insights..." : "How else can I help you?"}
                rows={1}
                className="flex-1 resize-none text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none bg-transparent leading-relaxed"
                style={{ maxHeight: 120 }}
              />
              <button
                onClick={() => handleSend()}
                disabled={!input.trim() || loading}
                className="w-9 h-9 bg-brand-blue hover:bg-brand-blue-dark disabled:bg-gray-200 flex items-center justify-center transition-colors shrink-0"
              >
                {loading
                  ? <Loader2 size={15} className="text-white animate-spin" />
                  : <Send size={15} className="text-white" />
                }
              </button>
            </div>
            <p className="text-center text-xs text-gray-400 mt-2">
              This is an AI experiment. Responses are based only on published insights and should be verified with sources cited.{' '}
              <button className="text-brand-blue hover:underline">See more</button>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
