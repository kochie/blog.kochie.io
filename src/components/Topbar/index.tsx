import React, { type ReactElement } from 'react'
import Link from 'next/link'
import { ThemeButton } from '@/components/Theme'

const Topbar = (): ReactElement => {
  return (
    <header className="sticky top-0 z-40 bg-bg/95 backdrop-blur border-b border-rule">
      <div className="mx-auto max-w-bleed px-4 h-14 flex items-center justify-between">
        <Link
          href="/"
          className="font-serif font-semibold text-text leading-none text-lg hover:text-accent transition-colors duration-fast"
        >
          Kochie Engineering <span className="text-accent">/</span> Blog
        </Link>
        <nav className="flex items-center gap-6 font-sans text-ui text-text-mute">
          <Link
            href="/archive"
            className="hover:text-accent transition-colors duration-fast"
          >
            Archive
          </Link>
          <Link
            href="/tags"
            className="hover:text-accent transition-colors duration-fast"
          >
            Tags
          </Link>
          <Link
            href="/authors"
            className="hover:text-accent transition-colors duration-fast"
          >
            Authors
          </Link>
          <a
            href="/feed/rss.xml"
            className="hover:text-accent transition-colors duration-fast"
          >
            RSS
          </a>
          <ThemeButton />
        </nav>
      </div>
    </header>
  )
}

export default Topbar
