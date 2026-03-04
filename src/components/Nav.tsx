'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Menu, X, Search, ChevronDown } from 'lucide-react'

export default function Nav() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
      {/* Top thin blue bar */}
      <div className="h-1 bg-brand-blue w-full" />

      <nav className="max-w-7xl mx-auto px-6 flex items-center justify-between h-14">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <div className="w-8 h-8 bg-brand-blue flex items-center justify-center">
            <span className="text-white font-bold text-sm" style={{ fontFamily: 'Georgia, serif' }}>I</span>
          </div>
          <span className="font-bold text-gray-900 text-base tracking-tight">INSIGHTS</span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-1">
          {['Featured', 'Topics', 'Industries', 'Functions', 'About'].map((item) => (
            <button key={item} className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-700 hover:text-brand-blue transition-colors font-medium">
              {item}
              {item !== 'About' && <ChevronDown size={12} />}
            </button>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-3">
          <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <Search size={16} className="text-gray-600" />
          </button>
          <Link
            href="/ask"
            className="flex items-center gap-1.5 bg-brand-blue text-white text-sm font-semibold px-4 py-2 hover:bg-brand-blue-dark transition-colors"
          >
            <span className="text-xs">✦</span>
            Ask Insights
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-gray-200 px-6 py-4 space-y-3">
          {['Featured', 'Topics', 'Industries', 'Functions', 'About'].map((item) => (
            <a key={item} href="#" className="block text-sm text-gray-700 font-medium py-1">
              {item}
            </a>
          ))}
          <Link
            href="/ask"
            className="block text-center bg-brand-blue text-white text-sm font-semibold px-4 py-2 mt-2"
            onClick={() => setMobileOpen(false)}
          >
            ✦ Ask Insights
          </Link>
        </div>
      )}
    </header>
  )
}
