import React, { type ReactElement } from 'react'
import Link from 'next/link'
import { ThemeButton } from '@/components/Theme'
import TopbarBrand from './brand'

const Topbar = (): ReactElement => {
  return (
    <header className="sticky top-0 z-40 bg-bg/95 backdrop-blur border-b border-rule">
      <div className="mx-auto max-w-bleed px-4 h-14 flex items-center justify-between gap-3">
        <TopbarBrand />
        <nav className="flex items-center gap-3 sm:gap-6 font-sans text-ui text-text-mute shrink-0">
          <Link
            href="/archive"
            className="hover:text-accent transition-colors duration-fast"
          >
            Archive
          </Link>
          <Link
            href="/projects"
            className="hover:text-accent transition-colors duration-fast"
          >
            Projects
          </Link>
          <Link
            href="/journal"
            className="hover:text-accent transition-colors duration-fast"
          >
            Journal
          </Link>
          <Link
            href="/tags"
            className="hover:text-accent transition-colors duration-fast"
          >
            Tags
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
