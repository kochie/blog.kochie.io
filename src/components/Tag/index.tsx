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

export const Tag = ({ name, link, inverted }: TagProps): React.ReactElement => {
  return (
    <Link href={'/tags/[tagId]'} as={link}>
      <a>
        <div
          className={`${!inverted ? style['tag'] : style['tag-inverted']} ${
            style['tag-common']
          }`}
        >
          {name}
        </div>
      </a>
    </Link>
  )
}

export const TagSet = ({
  children,
  className,
}: TagSetProps): React.ReactElement => {
  return <div className={`${className} ${style.tagSet}`}>{children}</div>
}
