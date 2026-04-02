import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '武林考験 — Dland Quiz Platform',
  description: 'Multi-subject dland quiz platform',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" style={{ background: '#030308' }}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Noto+Serif+JP:wght@300;400;500;700&family=Noto+Sans+JP:wght@300;400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        style={{
          background: 'radial-gradient(ellipse at 25% 25%, #3b2a6d 0%, #123c3b 40%, #0a0f1f 75%, #030308 100%)',
          backgroundAttachment: 'fixed',
          minHeight: '100vh',
        }}
        className="antialiased"
      >
        {children}
      </body>
    </html>
  )
}
