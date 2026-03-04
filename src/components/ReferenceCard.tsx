import { Reference } from '@/types'
import { FileText, Play, BookOpen, ExternalLink } from 'lucide-react'
import Link from 'next/link'

interface ReferenceCardProps {
  reference: Reference
}

export default function ReferenceCard({ reference }: ReferenceCardProps) {
  const isInternal = reference.url?.startsWith('/')
  const Wrapper = ({ children }: { children: React.ReactNode }) =>
    isInternal ? (
      <Link href={reference.url!} className="ref-card block">
        {children}
      </Link>
    ) : (
      <a href={reference.url} target="_blank" rel="noopener noreferrer" className="ref-card block">
        {children}
      </a>
    )

  if (reference.type === 'blog') {
    return (
      <Wrapper>
        <div className="bg-white border border-gray-200 p-4 hover:border-brand-blue transition-all cursor-pointer" style={{ minWidth: 220, maxWidth: 260 }}>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-6 h-6 bg-brand-blue flex items-center justify-center shrink-0">
              <BookOpen size={12} className="text-white" />
            </div>
            <span className="text-xs font-semibold text-brand-blue uppercase tracking-wide">Article</span>
          </div>
          <h4 className="text-sm font-semibold text-gray-900 leading-snug mb-1 line-clamp-2">
            {reference.title}
          </h4>
          {reference.subtitle && (
            <p className="text-xs text-gray-400 mb-2">{reference.subtitle}</p>
          )}
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400">{reference.meta}</span>
            <ExternalLink size={11} className="text-gray-300" />
          </div>
        </div>
      </Wrapper>
    )
  }

  if (reference.type === 'video') {
    return (
      <Wrapper>
        <div className="bg-white border border-gray-200 overflow-hidden hover:border-brand-blue transition-all cursor-pointer ref-card" style={{ minWidth: 220, maxWidth: 260 }}>
          {/* Video thumbnail area */}
          <div className="relative h-28 bg-gray-900 flex items-center justify-center">
            <div className="w-10 h-10 rounded-full bg-white/20 border-2 border-white flex items-center justify-center">
              <Play size={16} className="text-white ml-0.5" fill="white" />
            </div>
            <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-1.5 py-0.5 font-mono">
              {reference.meta}
            </div>
          </div>
          <div className="p-3">
            <div className="flex items-center gap-1.5 mb-1">
              <span className="text-xs font-semibold text-red-500 uppercase tracking-wide">▶ Video</span>
            </div>
            <h4 className="text-sm font-semibold text-gray-900 leading-snug line-clamp-2">
              {reference.title}
            </h4>
            {reference.topic && (
              <p className="text-xs text-gray-400 mt-1">{reference.topic}</p>
            )}
          </div>
        </div>
      </Wrapper>
    )
  }

  if (reference.type === 'document') {
    return (
      <Wrapper>
        <div className="bg-white border border-gray-200 p-4 hover:border-brand-blue transition-all cursor-pointer ref-card" style={{ minWidth: 220, maxWidth: 260 }}>
          <div className="flex items-start gap-3">
            <div className="w-10 h-12 bg-gray-100 border border-gray-200 flex flex-col items-center justify-center shrink-0">
              <FileText size={16} className="text-brand-blue mb-0.5" />
              <span className="text-[9px] font-bold text-gray-400 uppercase">{reference.subtitle}</span>
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold text-gray-900 leading-snug mb-1 line-clamp-2">
                {reference.title}
              </h4>
              <p className="text-xs text-gray-400">{reference.meta}</p>
              <div className="flex items-center gap-1 mt-2">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                <span className="text-xs text-green-600">Available</span>
              </div>
            </div>
          </div>
        </div>
      </Wrapper>
    )
  }

  return null
}
