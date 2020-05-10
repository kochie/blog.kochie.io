import React from 'react'
import Link from 'next/link'

import style from './Tag.module.css'

interface TagProps {
  name: string
  link: string
}

interface TagSetProps {
  children: React.ReactNode
  className?: string
}

export const Tag = ({ name, link }: TagProps): React.ReactElement => {
  return (
    <Link href={'/tags/[tagId]'} as={link}>
      <div className={style.tag}>{name}</div>
    </Link>
  )
}

export const TagSet = ({
  children,
  className,
}: TagSetProps): React.ReactElement => {
  return <div className={`${className} ${style.tagSet}`}>{children}</div>
}
