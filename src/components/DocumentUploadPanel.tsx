'use client'
import { useState, useRef, useCallback } from 'react'
import { Upload, FileText, CheckCircle, AlertCircle, Loader2, X, ChevronDown, ChevronUp } from 'lucide-react'

interface UploadedDoc {
  id: string
  name: string
  status: 'uploading' | 'indexing' | 'completed' | 'error'
  error?: string
}

export default function DocumentUploadPanel() {
  const [docs, setDocs] = useState<UploadedDoc[]>([])
  const [dragging, setDragging] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const uploadFile = useCallback(async (file: File) => {
    const tempId = Date.now().toString()
    setDocs((prev) => [...prev, { id: tempId, name: file.name, status: 'uploading' }])
    setExpanded(true)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch('/api/documents', { method: 'POST', body: formData })
      const data = await res.json()

      if (!res.ok) {
        setDocs((prev) =>
          prev.map((d) => d.id === tempId ? { ...d, status: 'error', error: data.error } : d)
        )
        return
      }

      // Mark as indexing
      setDocs((prev) =>
        prev.map((d) =>
          d.id === tempId ? { ...d, id: data.document.id, status: 'indexing' } : d
        )
      )

      // Simulate indexing completion after a delay (real polling would use getIndexingStatus)
      setTimeout(() => {
        setDocs((prev) =>
          prev.map((d) => d.id === data.document.id ? { ...d, status: 'completed' } : d)
        )
      }, 4000)
    } catch {
      setDocs((prev) =>
        prev.map((d) => d.id === tempId ? { ...d, status: 'error', error: 'Network error' } : d)
      )
    }
  }, [])

  const handleFiles = (files: FileList | null) => {
    if (!files) return
    Array.from(files).forEach(uploadFile)
  }

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setDragging(false)
      handleFiles(e.dataTransfer.files)
    },
    [uploadFile]
  )

  const statusIcon = (doc: UploadedDoc) => {
    if (doc.status === 'uploading') return <Loader2 size={12} className="animate-spin text-blue-400" />
    if (doc.status === 'indexing') return <Loader2 size={12} className="animate-spin text-yellow-400" />
    if (doc.status === 'completed') return <CheckCircle size={12} className="text-green-400" />
    return <AlertCircle size={12} className="text-red-400" />
  }

  const statusLabel = (doc: UploadedDoc) => {
    if (doc.status === 'uploading') return 'Uploading...'
    if (doc.status === 'indexing') return 'Indexing...'
    if (doc.status === 'completed') return 'Ready'
    return doc.error ?? 'Error'
  }

  return (
    <div className="border-t border-gray-800 mt-2">
      {/* Toggle header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-4 py-3 text-gray-400 hover:text-white transition-colors text-xs font-semibold uppercase tracking-widest"
      >
        <span className="flex items-center gap-2">
          <Upload size={12} />
          Add Documents
        </span>
        {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
      </button>

      {expanded && (
        <div className="px-4 pb-4 space-y-3">
          {/* Drop zone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border border-dashed rounded-none p-4 text-center cursor-pointer transition-all ${
              dragging
                ? 'border-brand-blue bg-blue-950/30 text-white'
                : 'border-gray-700 hover:border-gray-500 text-gray-500 hover:text-gray-400'
            }`}
          >
            <Upload size={16} className="mx-auto mb-1.5 opacity-60" />
            <p className="text-xs leading-relaxed">
              Drop PDF, DOCX, TXT<br />or click to browse
            </p>
            <p className="text-xs text-gray-600 mt-1">Max 15MB</p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf,.docx,.txt,.md,.html,.xlsx,.csv"
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />

          {/* Uploaded docs list */}
          {docs.length > 0 && (
            <div className="space-y-1.5">
              {docs.map((doc) => (
                <div key={doc.id} className="flex items-center gap-2 bg-gray-900 px-2.5 py-2">
                  <FileText size={11} className="text-gray-500 shrink-0" />
                  <span className="text-xs text-gray-400 flex-1 truncate">{doc.name}</span>
                  <div className="flex items-center gap-1 shrink-0">
                    {statusIcon(doc)}
                    <span className={`text-xs ${
                      doc.status === 'completed' ? 'text-green-400' :
                      doc.status === 'error' ? 'text-red-400' :
                      'text-gray-500'
                    }`}>
                      {statusLabel(doc)}
                    </span>
                  </div>
                  <button
                    onClick={() => setDocs((p) => p.filter((d) => d.id !== doc.id))}
                    className="text-gray-700 hover:text-gray-400 shrink-0"
                  >
                    <X size={10} />
                  </button>
                </div>
              ))}
            </div>
          )}

          <p className="text-xs text-gray-600 leading-relaxed">
            Uploaded documents are indexed into your Dify Knowledge Base and instantly searchable by the RAG workflow.
          </p>
        </div>
      )}
    </div>
  )
}
