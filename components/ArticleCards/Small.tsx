import React from 'react'
import { CardDetails } from './'
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
    <div className={[style.card, style.small].join(' ')}>
      <Image
        {...image}
        width={''}
        height={200}
        style={{ backgroundColor: 'black', borderRadius: '10px 10px 0 0' }}
        loadOnObserve
      />
      <div style={{ padding: '10px' }}>
        <Set spacing="minor-1">
          {tags.map(tag => (
            <Link prefetch key={tag} href={`/tags/${tag}`}>
              <Tag palette="textTint">
                <a>{tag}</a>
              </Tag>
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
