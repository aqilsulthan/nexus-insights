import Link from 'next/link'
import { Article } from '@/types'
import { Clock, ArrowRight } from 'lucide-react'

interface ArticleCardProps {
  article: Article
  variant?: 'default' | 'featured' | 'compact'
}

export default function ArticleCard({ article, variant = 'default' }: ArticleCardProps) {
  if (variant === 'featured') {
    return (
      <Link href={`/blog/${article.slug}`} className="group block">
        <div
          className="relative h-72 flex flex-col justify-end p-8 overflow-hidden"
          style={{ background: article.heroColor }}
        >
          {/* Subtle texture overlay */}
          <div className="absolute inset-0 opacity-10"
            style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.1) 10px, rgba(255,255,255,0.1) 11px)' }}
          />
          <div className="relative z-10">
            <span className="text-xs font-semibold text-white/70 uppercase tracking-widest mb-3 block">
              {article.category}
            </span>
            <h2
              className="text-white text-2xl leading-tight mb-3 group-hover:underline"
              style={{ fontFamily: 'Playfair Display, Georgia, serif', fontWeight: 400 }}
            >
              {article.title}
            </h2>
            <div className="flex items-center gap-3 text-white/60 text-xs">
              <Clock size={12} />
              <span>{article.readTime}</span>
              <span>·</span>
              <span>{article.date}</span>
            </div>
          </div>
        </div>
        <div className="border border-t-0 border-gray-200 p-5">
          <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">{article.excerpt}</p>
          {article.stats && (
            <div className="flex gap-6 mt-4">
              {article.stats.slice(0, 2).map((s) => (
                <div key={s.number}>
                  <div className="text-xl font-semibold text-brand-blue" style={{ fontFamily: 'Playfair Display, serif' }}>{s.number}</div>
                  <div className="text-xs text-gray-500 leading-tight">{s.label}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Link>
    )
  }

  if (variant === 'compact') {
    return (
      <Link href={`/blog/${article.slug}`} className="group flex gap-4 items-start py-4 border-b border-gray-100 last:border-0 hover:bg-gray-50 -mx-2 px-2 transition-colors">
        <div
          className="w-12 h-12 shrink-0 flex items-center justify-center text-white text-lg font-bold"
          style={{ background: article.heroColor, fontFamily: 'Playfair Display, serif' }}
        >
          {article.title[0]}
        </div>
        <div>
          <span className="text-xs text-brand-blue font-semibold uppercase tracking-wide">{article.category}</span>
          <h3 className="text-sm font-semibold text-gray-900 mt-0.5 leading-snug group-hover:text-brand-blue transition-colors">
            {article.title}
          </h3>
          <div className="text-xs text-gray-400 mt-1 flex items-center gap-2">
            <Clock size={10} />
            {article.readTime}
          </div>
        </div>
      </Link>
    )
  }

  return (
    <Link href={`/blog/${article.slug}`} className="group block border border-gray-200 hover:border-brand-blue transition-all ref-card overflow-hidden">
      <div className="h-2 w-full" style={{ background: article.heroColor }} />
      <div className="p-6">
        <span className="text-xs font-semibold text-brand-blue uppercase tracking-widest">{article.category}</span>
        <h3
          className="text-gray-900 text-lg mt-2 mb-3 leading-snug group-hover:text-brand-blue transition-colors"
          style={{ fontFamily: 'Playfair Display, Georgia, serif', fontWeight: 400 }}
        >
          {article.title}
        </h3>
        <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed mb-4">{article.excerpt}</p>
        <div className="flex items-center justify-between text-xs text-gray-400">
          <div className="flex items-center gap-2">
            <Clock size={11} />
            <span>{article.readTime}</span>
          </div>
          <span className="text-brand-blue font-semibold flex items-center gap-1 group-hover:gap-2 transition-all">
            Read <ArrowRight size={12} />
          </span>
        </div>
      </div>
    </Link>
  )
}
