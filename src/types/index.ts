export interface Article {
  id: string
  slug: string
  title: string
  subtitle: string
  category: string
  date: string
  readTime: string
  author: string
  authorRole: string
  heroColor: string
  excerpt: string
  content: string // HTML string
  tags: string[]
  stats?: { number: string; label: string }[]
}

export interface Video {
  id: string
  title: string
  duration: string
  thumbnail: string
  url: string
  topic: string
}

export interface Document {
  id: string
  title: string
  type: 'PDF' | 'Report' | 'Guide' | 'Brief'
  pages: number
  topic: string
  url: string
  date: string
}

export interface Reference {
  type: 'blog' | 'video' | 'document'
  id: string
  title: string
  subtitle?: string
  url?: string
  thumbnail?: string
  meta?: string // "12 min read", "8:30", "24 pages PDF"
  topic?: string
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  references?: Reference[]
  disclaimer?: string
}
