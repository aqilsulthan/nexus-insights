import Link from 'next/link'
import Nav from '@/components/Nav'
import ArticleCard from '@/components/ArticleCard'
import { articles } from '@/lib/knowledge-base'
import { topicsStore, StoredTopic } from '@/lib/topics-store'
import { Article } from '@/types'
import { ArrowRight, Sparkles, ChevronRight } from 'lucide-react'

// force-dynamic supaya topicsStore selalu dibaca ulang dari disk
// setiap request, bukan di-cache saat build
export const dynamic = 'force-dynamic'

const categories = [
  'All',
  'Artificial Intelligence',
  'Digital Transformation',
  'Leadership',
  'Strategy',
  'Finance',
]

// Konversi StoredTopic → Article agar bisa dipakai ArticleCard
function storedToArticle(t: StoredTopic): Article {
  return {
    id: t.id,
    slug: t.slug,
    title: t.title,
    subtitle: t.subtitle,
    category: t.category,
    date: t.date,
    readTime: t.readTime,
    author: t.author,
    authorRole: t.authorRole,
    heroColor: t.heroColor,
    excerpt: t.excerpt,
    content: t.content,
    tags: t.tags,
    stats: t.stats,
  }
}

export default function HomePage() {
  // 1. Load artikel dinamis dari topicsStore (hasil upload /admin)
  const dynamicTopics = topicsStore.getAll().map(storedToArticle)

  // 2. Gabungkan dengan artikel statis dari knowledge-base.ts
  //    Artikel dinamis diutamakan — jika slug sama, pakai versi dinamis
  const dynamicSlugs = new Set(dynamicTopics.map((t) => t.slug))
  const staticFiltered = articles.filter((a) => !dynamicSlugs.has(a.slug))
  const allArticles: Article[] = [...dynamicTopics, ...staticFiltered]

  const featured = allArticles[0]
  const secondary = allArticles.slice(1, 3)
  const rest = allArticles.slice(3)

  return (
    <div className="min-h-screen bg-white">
      <Nav />

      {/* Ask Insights CTA banner */}
      <div className="bg-brand-blue text-white py-3 px-6 text-center">
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-3 flex-wrap">
          <Sparkles size={14} className="text-blue-300" />
          <span className="text-sm">
            New: Ask questions across all our published research with AI
          </span>
          <Link
            href="/ask"
            className="flex items-center gap-1.5 text-sm font-semibold text-white border border-white/40 hover:border-white px-4 py-1 transition-colors"
          >
            Try Ask Insights <ArrowRight size={12} />
          </Link>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-6 py-10">

        {/* Badge jumlah artikel dari upload — hanya tampil kalau ada */}
        {dynamicTopics.length > 0 && (
          <div className="flex items-center gap-2 mb-6 text-xs text-gray-500">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            <span>
              <strong className="text-gray-700">{dynamicTopics.length}</strong>
              {' '}topic{dynamicTopics.length > 1 ? 's' : ''} published from uploaded documents
            </span>
            <Link
              href="/admin"
              className="text-brand-blue font-semibold hover:underline ml-1"
            >
              Manage →
            </Link>
          </div>
        )}

        {/* Category filter */}
        <div className="flex gap-1 overflow-x-auto pb-2 mb-8 border-b border-gray-200">
          {categories.map((cat, i) => (
            <button
              key={cat}
              className={`px-4 py-2 text-sm font-semibold whitespace-nowrap transition-colors ${i === 0
                  ? 'bg-brand-blue text-white'
                  : 'text-gray-600 hover:text-brand-blue hover:bg-gray-50'
                }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Featured grid — hanya render kalau ada artikel */}
        {featured && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
            <div className="lg:col-span-2">
              <ArticleCard article={featured} variant="featured" />
            </div>
            <div className="flex flex-col gap-6">
              {secondary.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          </div>
        )}

        {/* More Insights */}
        {rest.length > 0 && (
          <>
            <div className="flex items-center gap-4 mb-8">
              <div className="h-px flex-1 bg-gray-200" />
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                More Insights
              </span>
              <div className="h-px flex-1 bg-gray-200" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
              {rest.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          </>
        )}

        {/* Bottom Ask CTA */}
        <div className="border-2 border-brand-blue p-10 text-center mb-16">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-brand-blue mb-4">
            <Sparkles size={20} className="text-white" />
          </div>
          <h2
            className="text-2xl text-gray-900 mb-3"
            style={{ fontFamily: 'Playfair Display, Georgia, serif', fontWeight: 400 }}
          >
            Have a question about our research?
          </h2>
          <p className="text-gray-500 text-base mb-6 max-w-lg mx-auto">
            Ask Insights is an AI-powered chatbot that answers your questions based entirely
            on our published research — with article, video, and document references attached
            to every response.
          </p>
          <Link
            href="/ask"
            className="inline-flex items-center gap-2 bg-brand-blue text-white font-semibold px-8 py-3 hover:bg-brand-blue-dark transition-colors"
          >
            Ask a question <ChevronRight size={16} />
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-gray-950 text-gray-400 py-10 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 bg-white flex items-center justify-center">
                <span
                  className="text-brand-blue font-bold text-sm"
                  style={{ fontFamily: 'Georgia, serif' }}
                >
                  I
                </span>
              </div>
              <span className="font-bold text-white text-sm">INSIGHTS</span>
            </div>
            <p className="text-xs text-gray-500 max-w-xs leading-relaxed">
              Research and insights on AI, leadership, digital transformation, and global strategy.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-x-12 gap-y-2 text-xs">
            {['Privacy', 'Terms of Use', 'Cookie Policy', 'Sitemap', 'Accessibility', 'Contact'].map(
              (item) => (
                <a key={item} href="#" className="hover:text-white transition-colors py-0.5">
                  {item}
                </a>
              )
            )}
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-8 pt-6 border-t border-gray-800 text-xs text-gray-600">
          © 2025 Insights Platform. All rights reserved.
        </div>
      </footer>
    </div>
  )
}
