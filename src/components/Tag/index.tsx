import React from 'react'
import Link from 'next/link'

interface TagProps {
  name: string
  link: string
  /**
   * Inverted variant fills the chip with `accent` instead of using a border.
   * Used in places where the chip needs more visual weight (e.g. on a hero).
   */
  inverted?: boolean
}

interface TagSetProps {
  children: React.ReactNode
  className?: string
}

export function Tag({ name, link, inverted }: TagProps) {
  const base =
    'inline-block font-mono text-meta tracking-wide px-3 py-1 rounded-full transition-colors duration-fast'
  const bordered =
    'border border-rule text-text-mute hover:text-accent hover:border-accent'
  const filled = 'bg-accent text-bg hover:bg-accent/85'
  return (
    <Link href={link} className={`${base} ${inverted ? filled : bordered}`}>
      {name}
    </Link>
  )
}

export function TagSet({ children, className }: TagSetProps) {
  return (
    <div className={`flex flex-wrap items-center gap-2 ${className ?? ''}`}>
      {children}
    </div>
  )
}
