'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import { ArrowLeft, Upload, FileText, CheckCircle2, AlertCircle, Loader2, Trash2, RefreshCw, BookOpen, ChevronRight, GitBranch, Sparkles, Info, Eye } from 'lucide-react'

interface ProcessedTopic { slug: string; title: string; category: string; version: string; versionNotes: string | null; date: string; sourceFile: string }
interface ProcessResult { success: boolean; action: 'create' | 'update'; slug: string; title: string; version: string; message: string }
interface KBDoc { id: string; name: string; status: string; wordCount: number; createdAt: number }

const CATEGORIES = ['Artificial Intelligence', 'Digital Transformation', 'Leadership', 'Strategy', 'Finance', 'Operations']

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    waiting: { label: 'Waiting', cls: 'text-gray-500 bg-gray-100' },
    parsing: { label: 'Parsing', cls: 'text-blue-600 bg-blue-50' },
    indexing: { label: 'Indexing', cls: 'text-yellow-600 bg-yellow-50' },
    completed: { label: 'Ready', cls: 'text-green-700 bg-green-50' },
    error: { label: 'Error', cls: 'text-red-600 bg-red-50' },
  }
  const s = map[status] ?? map.waiting
  return <span className={`text-xs font-semibold px-2 py-0.5 ${s.cls}`}>{s.label}</span>
}

export default function AdminPage() {
  const [file, setFile] = useState<File | null>(null)
  const [authorName, setAuthorName] = useState('')
  const [authorRole, setAuthorRole] = useState('')
  const [category, setCategory] = useState(CATEGORIES[0])
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [processing, setProcessing] = useState(false)
  const [processResult, setProcessResult] = useState<ProcessResult | null>(null)
  const [processError, setProcessError] = useState<string | null>(null)
  const [topics, setTopics] = useState<ProcessedTopic[]>([])
  const [kbDocs, setKbDocs] = useState<KBDoc[]>([])
  const [loadingData, setLoadingData] = useState(true)
  const [deletingSlug, setDeletingSlug] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'upload' | 'topics' | 'kb'>('upload')

  const loadData = useCallback(async () => {
    try {
      const [t, k] = await Promise.all([fetch('/api/topics'), fetch('/api/documents')])
      const [td, kd] = await Promise.all([t.json(), k.json()])
      setTopics(td.topics ?? [])
      setKbDocs(kd.documents ?? [])
    } catch { /* silent */ }
    finally { setLoadingData(false) }
  }, [])

  useEffect(() => { loadData() }, [loadData])

  const handleProcess = async () => {
    if (!file) return
    setProcessing(true); setProcessResult(null); setProcessError(null)
    const fd = new FormData()
    fd.append('file', file)
    fd.append('author_name', authorName || 'Insights Editorial')
    fd.append('author_role', authorRole || 'Research Team')
    fd.append('category', category)
    try {
      const res = await fetch('/api/process', { method: 'POST', body: fd })
      const data = await res.json()
      if (!res.ok) setProcessError(data.error ?? 'Processing failed')
      else { setProcessResult(data); setFile(null); loadData() }
    } catch { setProcessError('Network error') }
    finally { setProcessing(false) }
  }

  const handleDelete = async (slug: string) => {
    if (!confirm('Delete ' + slug + '?')) return
    setDeletingSlug(slug)
    try {
      await fetch('/api/topics', { method: 'DELETE', body: JSON.stringify({ slug }), headers: { 'Content-Type': 'application/json' } })
      loadData()
    } finally { setDeletingSlug(null) }
  }

  const tabs = [
    { id: 'upload' as const, label: 'Upload & Process' },
    { id: 'topics' as const, label: 'Published Topics' },
    { id: 'kb' as const, label: 'Knowledge Base' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors">
            <ArrowLeft size={14} /> Home
          </Link>
          <ChevronRight size={12} className="text-gray-300" />
          <span className="text-sm font-semibold text-gray-900">Knowledge Management</span>
          <div className="ml-auto flex items-center gap-2">
            <span className="text-xs text-gray-400 bg-gray-100 px-3 py-1.5 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />Dify Agent
            </span>
            <Link href="/ask" className="text-xs font-semibold bg-brand-blue text-white px-3 py-1.5 hover:bg-brand-blue-dark flex items-center gap-1.5 transition-colors">
              <Sparkles size={11} /> Ask Insights
            </Link>
          </div>
        </div>
        <div className="max-w-6xl mx-auto px-6 flex border-t border-gray-100">
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={'px-5 py-3 text-sm font-semibold border-b-2 transition-colors ' + (activeTab === tab.id ? 'border-brand-blue text-brand-blue' : 'border-transparent text-gray-500 hover:text-gray-900')}>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-6 py-10">
        {activeTab === 'upload' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div>
                <h1 className="text-2xl text-gray-900 mb-1" style={{ fontFamily: 'Playfair Display,serif', fontWeight: 400 }}>Upload Document</h1>
                <p className="text-sm text-gray-500">The Dify Knowledge Agent extracts content, detects if the topic exists, and publishes or updates a blog post automatically.</p>
              </div>

              <div
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => { e.preventDefault(); setIsDragging(false); if (e.dataTransfer.files[0]) setFile(e.dataTransfer.files[0]) }}
                onClick={() => fileInputRef.current?.click()}
                className={'border-2 border-dashed p-10 text-center cursor-pointer transition-all ' + (isDragging ? 'border-brand-blue bg-blue-50' : file ? 'border-green-400 bg-green-50' : 'border-gray-300 hover:border-brand-blue hover:bg-gray-50')}
              >
                <input ref={fileInputRef} type="file" className="hidden"
                  accept=".pdf,.txt,.md,.docx,.html,.srt,.vtt,.csv"
                  onChange={(e) => e.target.files?.[0] && setFile(e.target.files[0])} />
                <Upload size={32} className={'mx-auto mb-3 ' + (file ? 'text-green-500' : 'text-gray-400')} />
                {file ? (
                  <div>
                    <p className="font-semibold text-green-700">{file.name}</p>
                    <p className="text-xs text-green-600 mt-1">{(file.size / 1024).toFixed(1)} KB · Click to change</p>
                  </div>
                ) : (
                  <div>
                    <p className="font-semibold text-gray-700">Drop file here or click to browse</p>
                    <p className="text-xs text-gray-400 mt-1">PDF, DOCX, TXT, MD, HTML, SRT, VTT · Max 15MB</p>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-600 uppercase tracking-wide block mb-1.5">Author Name</label>
                  <input value={authorName} onChange={(e) => setAuthorName(e.target.value)} placeholder="e.g. Jane Smith" className="w-full border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-brand-blue" />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-600 uppercase tracking-wide block mb-1.5">Author Role</label>
                  <input value={authorRole} onChange={(e) => setAuthorRole(e.target.value)} placeholder="e.g. Senior Partner" className="w-full border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-brand-blue" />
                </div>
                <div className="col-span-2">
                  <label className="text-xs font-bold text-gray-600 uppercase tracking-wide block mb-1.5">Category</label>
                  <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-brand-blue bg-white">
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <button onClick={handleProcess} disabled={!file || processing}
                className="w-full flex items-center justify-center gap-2 bg-brand-blue text-white font-semibold py-3 hover:bg-brand-blue-dark disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors">
                {processing ? <><Loader2 size={16} className="animate-spin" />Processing with Dify Agent...</> : <><Sparkles size={16} />Process &amp; Publish</>}
              </button>

              {processing && (
                <div className="bg-blue-50 border border-blue-100 p-5">
                  <p className="text-xs font-bold text-blue-700 uppercase tracking-wide mb-3">Agent Pipeline Running</p>
                  {['Document Classifier — extracting raw text', 'Content Extractor — identifying insights & stats', 'Topic Detector — checking for duplicates', 'Blog Generator — writing editorial content', 'KB Indexer — uploading to Dify Knowledge Base'].map((s, i) => (
                    <div key={i} className="flex items-center gap-2 mb-1.5">
                      <Loader2 size={11} className="animate-spin text-blue-400 shrink-0" />
                      <span className="text-xs text-blue-600">{s}</span>
                    </div>
                  ))}
                </div>
              )}

              {processResult && (
                <div className={'border p-5 ' + (processResult.action === 'create' ? 'bg-green-50 border-green-200' : 'bg-amber-50 border-amber-200')}>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 size={18} className={processResult.action === 'create' ? 'text-green-600' : 'text-amber-600'} />
                    <div>
                      <p className={'font-semibold text-sm ' + (processResult.action === 'create' ? 'text-green-800' : 'text-amber-800')}>
                        {processResult.action === 'create' ? 'New Topic Published' : 'Existing Topic Updated'}
                      </p>
                      <p className="text-xs mt-1 text-gray-600">{processResult.message}</p>
                      <div className="flex gap-3 mt-3">
                        <Link href={'/blog/' + processResult.slug} className="text-xs font-semibold text-brand-blue border border-brand-blue px-3 py-1.5 hover:bg-brand-blue hover:text-white flex items-center gap-1.5 transition-colors">
                          <Eye size={12} /> View Article
                        </Link>
                        <span className="text-xs text-gray-500 flex items-center gap-1.5"><GitBranch size={12} /> v{processResult.version}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {processError && (
                <div className="bg-red-50 border border-red-200 p-4 flex items-start gap-3">
                  <AlertCircle size={16} className="text-red-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-red-800">Processing Failed</p>
                    <p className="text-xs text-red-600 mt-1">{processError}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-5">
              <div className="bg-white border border-gray-200 p-5">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">What the Agent Does</h3>
                {[{ step: '1', text: 'Extracts & cleans raw text from your file' }, { step: '2', text: 'Identifies title, stats, sections & tags' }, { step: '3', text: 'Checks if this topic already exists' }, { step: '4', text: 'Writes full blog article (Professional style)' }, { step: '5', text: "If duplicate: updates version with What's New" }, { step: '6', text: 'Indexes content into Dify Knowledge Base for RAG' }].map(({ step, text }) => (
                  <div key={step} className="flex gap-3 text-xs text-gray-600 mb-2.5">
                    <div className="w-5 h-5 bg-brand-blue text-white flex items-center justify-center text-xs shrink-0">{step}</div>
                    {text}
                  </div>
                ))}
              </div>
              <div className="bg-white border border-gray-200 p-5">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Supported Formats</h3>
                <div className="grid grid-cols-4 gap-1.5">
                  {['PDF', 'DOCX', 'TXT', 'MD', 'HTML', 'SRT', 'VTT', 'CSV'].map(f => (
                    <div key={f} className="text-xs font-bold text-center text-gray-600 bg-gray-100 py-1.5">{f}</div>
                  ))}
                </div>
                <p className="text-xs text-gray-400 mt-2">SRT/VTT = video subtitles/transcripts</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'topics' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl text-gray-900" style={{ fontFamily: 'Playfair Display,serif', fontWeight: 400 }}>Published Topics</h1>
                <p className="text-sm text-gray-500 mt-1">{topics.length} AI-generated topics</p>
              </div>
              <button onClick={loadData} className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-brand-blue transition-colors">
                <RefreshCw size={13} /> Refresh
              </button>
            </div>
            {loadingData ? (
              <div className="flex justify-center py-16"><Loader2 className="animate-spin text-gray-400" /></div>
            ) : topics.length === 0 ? (
              <div className="text-center py-20 border-2 border-dashed border-gray-200">
                <BookOpen size={36} className="text-gray-300 mx-auto mb-3" />
                <p className="text-gray-400">No topics yet. Upload a document to get started.</p>
              </div>
            ) : (
              <div className="bg-white border border-gray-200 divide-y divide-gray-100">
                {topics.map(topic => (
                  <div key={topic.slug} className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors">
                    <div className="w-10 h-10 bg-brand-blue flex items-center justify-center text-white font-bold text-sm shrink-0">{topic.title[0]}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-gray-900 truncate">{topic.title}</p>
                        {topic.version && topic.version !== '1.0' && (
                          <span className="text-xs text-amber-600 bg-amber-50 border border-amber-200 px-1.5 py-0.5 flex items-center gap-1 shrink-0">
                            <GitBranch size={10} /> v{topic.version}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">{topic.category} · {topic.date}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Link href={'/blog/' + topic.slug} className="p-2 hover:bg-brand-blue hover:text-white text-gray-400 border border-gray-200 hover:border-brand-blue transition-colors">
                        <Eye size={14} />
                      </Link>
                      <button onClick={() => handleDelete(topic.slug)} disabled={deletingSlug === topic.slug}
                        className="p-2 hover:bg-red-50 hover:text-red-600 text-gray-400 border border-gray-200 hover:border-red-300 transition-colors">
                        {deletingSlug === topic.slug ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'kb' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl text-gray-900" style={{ fontFamily: 'Playfair Display,serif', fontWeight: 400 }}>Dify Knowledge Base</h1>
                <p className="text-sm text-gray-500 mt-1">{kbDocs.length} documents indexed for RAG</p>
              </div>
              <button onClick={loadData} className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-brand-blue transition-colors">
                <RefreshCw size={13} /> Refresh
              </button>
            </div>
            <div className="bg-blue-50 border border-blue-100 px-4 py-3 mb-6 flex items-start gap-2 text-xs text-blue-700">
              <Info size={13} className="mt-0.5 shrink-0" />
              These documents are searchable in the <Link href="/ask" className="font-semibold underline mx-1">Ask Insights</Link> chatbot via Dify Knowledge Retrieval.
            </div>
            {kbDocs.length === 0 ? (
              <div className="text-center py-20 border-2 border-dashed border-gray-200">
                <BookOpen size={36} className="text-gray-300 mx-auto mb-3" />
                <p className="text-gray-400">No documents indexed. Process a document in the Upload tab.</p>
              </div>
            ) : (
              <div className="bg-white border border-gray-200 divide-y divide-gray-100">
                {kbDocs.map(doc => (
                  <div key={doc.id} className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50">
                    <FileText size={16} className="text-brand-blue shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{doc.name}</p>
                      <p className="text-xs text-gray-400">{doc.wordCount.toLocaleString()} words</p>
                    </div>
                    <StatusBadge status={doc.status} />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
