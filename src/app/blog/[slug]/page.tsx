import { notFound } from 'next/navigation'
import Link from 'next/link'
import Nav from '@/components/Nav'
import { articles } from '@/lib/knowledge-base'
import { topicsStore } from '@/lib/topics-store'
import { Clock, Calendar, ChevronRight, Sparkles, GitBranch, Share2, BookmarkPlus } from 'lucide-react'

interface PageProps { params: { slug: string } }
export const dynamic = 'force-dynamic'

export default function BlogPage({ params }: PageProps) {
  const dynamicTopic = topicsStore.getBySlug(params.slug)
  const staticArticle = articles.find((a) => a.slug === params.slug)
  if (!dynamicTopic && !staticArticle) notFound()

  const a = dynamicTopic ?? {
    ...staticArticle!,
    version: '1.0', versionNotes: null, sourceFile: null,
    authorRole: staticArticle!.authorRole,
  }

  return (
    <div className="min-h-screen bg-white">
      <Nav />
      <div className="border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-6 py-3 flex items-center gap-2 text-xs text-gray-500">
          <Link href="/" className="hover:text-brand-blue">Home</Link>
          <ChevronRight size={12} />
          <span className="text-brand-blue font-medium">{a.category}</span>
        </div>
      </div>
      <article className="max-w-5xl mx-auto px-6">
        <header className="py-12 border-b border-gray-200">
          <div className="max-w-3xl">
            {a.version && a.version !== '1.0' && (
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-200 text-amber-700 text-xs px-3 py-1.5 font-semibold">
                  <GitBranch size={11} />
                  Version {a.version}
                  {a.versionNotes && <span className="font-normal ml-1">· {a.versionNotes}</span>}
                </div>
              </div>
            )}
            <span className="inline-block text-xs font-bold text-white uppercase tracking-widest px-3 py-1.5 mb-5" style={{ background: a.heroColor }}>
              {a.category}
            </span>
            <h1 className="text-4xl md:text-5xl text-gray-900 leading-tight mb-5" style={{ fontFamily: 'Playfair Display, Georgia, serif', fontWeight: 400 }}>
              {a.title}
            </h1>
            <p className="text-xl text-gray-500 leading-relaxed mb-6 font-light">{a.subtitle}</p>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-1.5">
                <div className="w-7 h-7 flex items-center justify-center text-white text-xs font-bold" style={{ background: a.heroColor }}>
                  {a.author[0]}
                </div>
                <div>
                  <div className="text-gray-900 font-semibold text-xs">{a.author}</div>
                  <div className="text-gray-400 text-xs">{a.authorRole}</div>
                </div>
              </div>
              <div className="h-4 w-px bg-gray-200" />
              <div className="flex items-center gap-1.5"><Calendar size={13} /><span>{a.date}</span></div>
              <div className="flex items-center gap-1.5"><Clock size={13} /><span>{a.readTime}</span></div>
            </div>
          </div>
        </header>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12 py-12">
          <div className="lg:col-span-3">
            {a.stats && a.stats.length > 0 && (
              <div className="border-l-4 border-brand-blue bg-gray-50 p-6 mb-8">
                <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Key Statistics</div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                  {a.stats.map((s) => (
                    <div key={s.number}>
                      <div className="text-3xl text-brand-blue mb-1" style={{ fontFamily: 'Playfair Display, serif' }}>{s.number}</div>
                      <div className="text-xs text-gray-500">{s.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="prose-nexus" dangerouslySetInnerHTML={{ __html: a.content }} />
            {a.sourceFile && (
              <div className="mt-8 pt-6 border-t border-gray-100">
                <div className="text-xs text-gray-400">
                  Generated from: <code className="bg-gray-100 px-1.5 py-0.5 text-gray-600">{a.sourceFile}</code>
                </div>
              </div>
            )}
            <div className="flex flex-wrap gap-2 mt-6 pt-6 border-t border-gray-200">
              {a.tags.map((tag: string) => (
                <span key={tag} className="text-xs font-semibold text-brand-blue border border-brand-blue px-3 py-1 hover:bg-brand-blue hover:text-white transition-colors cursor-pointer">
                  {tag}
                </span>
              ))}
            </div>
          </div>
          <aside className="hidden lg:block">
            <div className="border-2 border-brand-blue p-5 sticky top-20">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles size={14} className="text-brand-blue" />
                <span className="text-xs font-bold text-brand-blue uppercase tracking-wide">Ask Insights</span>
              </div>
              <p className="text-xs text-gray-600 mb-4 leading-relaxed">Questions about this research?</p>
              <Link href={`/ask?q=${encodeURIComponent(a.title)}`} className="block text-center bg-brand-blue text-white text-xs font-bold px-4 py-2.5 hover:bg-brand-blue-dark transition-colors">
                Ask about this article
              </Link>
            </div>
          </aside>
        </div>
      </article>
    </div>
  )
}
