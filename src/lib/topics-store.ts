/**
 * Topics Store
 * ─────────────────────────────────────────────────────────────────────
 * Manages the dynamic article/topic list.
 * In production, replace with a database (PostgreSQL, Supabase, MongoDB).
 * For this starter, we use a JSON file in /data/topics.json backed by
 * a module-level in-memory cache.
 */

import fs from 'fs'
import path from 'path'

// ── Gap 4: struktur snapshot versi lama ──────────────────────────────
export interface VersionSnapshot {
  version: string
  content: string       // HTML artikel versi lama
  excerpt: string
  stats: { number: string; label: string }[]
  versionNotes: string | null
  archivedAt: string    // ISO timestamp saat versi ini di-archive
}

export interface StoredTopic {
  id: string
  slug: string
  title: string
  subtitle: string
  category: string
  excerpt: string
  content: string       // HTML versi terbaru
  author: string
  authorRole: string
  heroColor: string
  readTime: string
  tags: string[]
  stats: { number: string; label: string }[]
  date: string
  version: string
  versionNotes: string | null
  sourceFile: string
  createdAt: string
  updatedAt: string
  // Gap 4: riwayat semua versi sebelumnya — tidak ditimpa, hanya ditambah
  versions: VersionSnapshot[]
  // Gap 1: document ID di Dify Knowledge Base — dipakai untuk delete saat update
  kbDocumentId: string | null
}

// ── Lokasi penyimpanan ────────────────────────────────────────────────
const DATA_DIR = path.join(process.cwd(), 'data')
const TOPICS_FILE = path.join(DATA_DIR, 'topics.json')

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true })
  }
}

function loadFromDisk(): StoredTopic[] {
  try {
    ensureDataDir()
    if (!fs.existsSync(TOPICS_FILE)) return []
    const raw = fs.readFileSync(TOPICS_FILE, 'utf-8')
    return JSON.parse(raw) as StoredTopic[]
  } catch {
    return []
  }
}

function saveToDisk(topics: StoredTopic[]) {
  try {
    ensureDataDir()
    fs.writeFileSync(TOPICS_FILE, JSON.stringify(topics, null, 2), 'utf-8')
  } catch (err) {
    console.error('[TopicsStore] Failed to save:', err)
  }
}

let _cache: StoredTopic[] | null = null

function getCache(): StoredTopic[] {
  if (_cache === null) {
    _cache = loadFromDisk()
  }
  return _cache
}

export const topicsStore = {
  getAll(): StoredTopic[] {
    return getCache()
  },

  getBySlug(slug: string): StoredTopic | undefined {
    return getCache().find((t) => t.slug === slug)
  },

  create(
    payload: Omit<StoredTopic, 'createdAt' | 'updatedAt' | 'versions' | 'kbDocumentId'>
  ): StoredTopic {
    const now = new Date().toISOString()
    const topic: StoredTopic = {
      ...payload,
      createdAt: now,
      updatedAt: now,
      versions: [],        // kosong untuk artikel baru
      kbDocumentId: null,  // diisi setelah upload KB sukses via setKbDocumentId()
    }
    const topics = getCache()
    topics.unshift(topic) // artikel terbaru di atas
    _cache = topics
    saveToDisk(topics)
    return topic
  },

  update(slug: string, updates: Partial<StoredTopic>): StoredTopic | null {
    const topics = getCache()
    const idx = topics.findIndex((t) => t.slug === slug)

    if (idx === -1) {
      // Slug belum ada — buat baru
      return topicsStore.create(
        updates as Omit<StoredTopic, 'createdAt' | 'updatedAt' | 'versions' | 'kbDocumentId'>
      )
    }

    const existing = topics[idx]

    // Gap 4: snapshot versi lama sebelum di-overwrite
    const snapshot: VersionSnapshot = {
      version: existing.version,
      content: existing.content,
      excerpt: existing.excerpt,
      stats: existing.stats,
      versionNotes: existing.versionNotes,
      archivedAt: new Date().toISOString(),
    }

    const updated: StoredTopic = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString(),
      // Tambah snapshot ke history — tidak menimpa history sebelumnya
      versions: [...(existing.versions ?? []), snapshot],
      // Gap 1: pertahankan kbDocumentId lama kecuali ada nilai baru
      // Nilai baru diset oleh setKbDocumentId() setelah delete + upload selesai
      kbDocumentId:
        updates.kbDocumentId !== undefined ? updates.kbDocumentId : existing.kbDocumentId,
    }

    topics[idx] = updated
    _cache = topics
    saveToDisk(topics)
    return updated
  },

  // Gap 1: dipanggil dari process route setelah upload KB sukses
  // Menyimpan document ID Dify agar bisa dihapus saat artikel di-update lagi
  setKbDocumentId(slug: string, kbDocumentId: string): void {
    const topics = getCache()
    const idx = topics.findIndex((t) => t.slug === slug)
    if (idx === -1) return
    topics[idx] = { ...topics[idx], kbDocumentId }
    _cache = topics
    saveToDisk(topics)
  },

  delete(slug: string): boolean {
    const topics = getCache()
    const idx = topics.findIndex((t) => t.slug === slug)
    if (idx === -1) return false
    topics.splice(idx, 1)
    _cache = topics
    saveToDisk(topics)
    return true
  },

  // Paksa reload dari disk — berguna setelah edit manual topics.json
  invalidate() {
    _cache = null
  },
}
