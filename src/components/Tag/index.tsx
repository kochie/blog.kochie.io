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

export const Tag = ({ name, link }: TagProps) => {
  return (
    <Link href={'/tags/[tagId]'} as={link}>
      <div className={style.tag}>{name}</div>
    </Link>
  )
}

export const TagSet = ({ children, className }: TagSetProps) => {
  return <div className={`${className} ${style.tagSet}`}>{children}</div>
}
