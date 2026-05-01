import React, { type ReactElement } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ThemeButton } from '@/components/Theme'

const Topbar = (): ReactElement => {
  return (
    <header className="sticky top-0 z-40 bg-bg/95 backdrop-blur border-b border-rule">
      <div className="mx-auto max-w-bleed px-4 h-14 flex items-center justify-between">
        <Link
          href="/"
          className="group flex items-center gap-3 font-serif font-semibold text-text leading-none text-lg hover:text-accent transition-colors duration-fast"
        >
          <Image
            src="/images/icons/blog-logo.svg"
            alt=""
            width={32}
            height={32}
            // Decorative — the brand text alongside it carries the accessible
            // name. Slightly desaturated by default, full colour on hover so
            // the logo subtly mirrors the link's hover-to-accent transition.
            aria-hidden
            priority
            className="h-8 w-8 shrink-0 opacity-90 group-hover:opacity-100 transition-opacity duration-fast"
          />
          <span>
            Kochie Engineering <span className="text-accent">/</span> Blog
          </span>
        </Link>
        <nav className="flex items-center gap-6 font-sans text-ui text-text-mute">
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
