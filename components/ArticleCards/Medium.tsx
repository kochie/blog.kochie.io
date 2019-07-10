import React from 'react'
import { CardDetails } from '.'
import { Image } from '../'
import Link from 'next/link'

import style from '../../styles/articleCards.less'
import { Set, Tag, Text, Paragraph, Heading } from 'fannypack'

export default ({
  title,
  image,
  blurb,
  readTime,
  tags,
  articleDir,
}: CardDetails) => {
  return (
    <div className={[style.card, style.medium].join(' ')}>
      <Image
        {...image}
        width={''}
        height={200}
        className={[style.image].join(' ')}
        loadOnObserve
      />
      <div style={{ padding: '10px' }}>
        <Set spacing="minor-1">
          {tags.map(tag => (
            <Link key={tag} href={`/tags/${tag}`}>
              <Tag palette="textTint">{tag}</Tag>
            </Link>
          ))}
        </Set>
        <Link href={`/articles/${articleDir}`}>
          <a>
            <Heading use="h4">{title}</Heading>
          </a>
        </Link>
        <Paragraph>{blurb}</Paragraph>
        <div className={style.readTime}>
          <Text use="sub">{readTime} min read</Text>
        </div>
      </div>
    </div>
  )
}
