import React from 'react'
import Link from 'next/link'
import { CardDetails, TagSet, Tag, Image } from '..'

import style from './ArticleCards.module.css'

const LargeCard = ({
  title,
  image,
  blurb,
  readTime,
  tags,
  articleDir,
}: CardDetails): React.ReactElement => {
  // const img = useRef<HTMLDivElement>(null)

  return (
    <div className={[style.card, style.large].join(' ')}>
      <div className={style.largeImageContainer}>
        <Image
          // {...image}
          lqip={image.lqip}
          src={image.url}
          // height={300}
          loadOnObserve
          className={style.largeImage}
        />
        <div className={`${style.tagsLarge}`}>
          <TagSet>
            {tags.map((tag) => (
              <Tag key={tag} name={tag} link={`/tags/${tag}`} />
            ))}
          </TagSet>
        </div>
      </div>
      <div className={style.details}>
        <Link href={'/articles/[articleId]'} as={`/articles/${articleDir}`}>
          <h2 className={`${style.heading}`}>{title}</h2>
        </Link>
        <p>{blurb}</p>
        <div className={style.readTime}>
          <sub>{readTime} min read</sub>
        </div>
      </div>
    </div>
  )
}

export default LargeCard
