import React from 'react'
import Link from 'next/link'

import style from './Tag.module.css'

interface TagProps {
  name: string
  link: string
  inverted?: boolean
}

interface TagSetProps {
  children: React.ReactNode
  className?: string
}

export function Tag({ name, link, inverted }: TagProps) {
  return (
    <Link href={link}>
      <div
        className={`${!inverted ? style['tag'] : style['tag-inverted']} ${
          style['tag-common']
        }`}
      >
        {name}
      </div>
    </Link>
  )
}

export function TagSet({ children, className }: TagSetProps) {
  return <div className={`${className} ${style.tagSet}`}>{children}</div>
}
