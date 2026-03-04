import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Insights | Strategy & Management Consulting',
  description: 'Research and insights on AI, leadership, digital transformation, and strategy.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600&family=Source+Sans+3:wght@300;400;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body style={{ fontFamily: "'Source Sans 3', 'Helvetica Neue', sans-serif" }}>
        {children}
      </body>
    </html>
  )
}
