import React, { ReactElement } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { TagSet, Tag, CardDetails, Card } from '..'

import style from './ArticleCards.module.css'

const MediumCard = ({
  title,
  image,
  blurb,
  readTime,
  tags,
  articleDir,
}: CardDetails): ReactElement => {
  return (
    <div className={style.medium}>
      <Card>
        <div className={style.flexContainer}>
          <div className={style.imageContainer}>
            <Image
              src={image.url}
              alt={image.alt}
              layout={'responsive'}
              height={300}
              width={600}
              className={style.image}
            />
            <div className={`${style.tagsMedium}`}>
              <TagSet>
                {tags.map((tag) => (
                  <Tag key={tag} name={tag} link={`/tags/${tag}`} />
                ))}
              </TagSet>
            </div>
          </div>
          <div style={{ padding: '10px' }}>
            <Link href={'/articles/[articleId]'} as={`/articles/${articleDir}`}>
              <h2 className={style.heading}>{title}</h2>
            </Link>
            <p className={style.blurb}>{blurb}</p>
            <div className={style.readTime}>
              <sub>{readTime} min read</sub>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}

export default MediumCard
