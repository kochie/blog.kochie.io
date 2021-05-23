import React, { PropsWithChildren } from 'react'
import Link from 'next/link'
import { Jumbotron, Card, Tag, TagSet } from '..'
import Image from 'next/image'

// eslint-disable-next-line import/no-unresolved
// import { Article as ArticleDetails } from 'articles.json'
// eslint-disable-next-line import/no-unresolved
// import { Author as AuthorDetails } from 'authors.json'

import style from './Article.module.css'
import { ArticleMetadata } from 'src/lib/article-path'
import { Author } from 'metadata.yaml'

interface ArticleProps {
  article: ArticleMetadata
  author: Author
}

interface AuthorLinkProps {
  username: string
  fullname: string
}

const Article = ({
  article,
  author,
  children,
}: PropsWithChildren<ArticleProps>): React.ReactElement => {
  const AuthorLink = ({
    username,
    fullname,
  }: AuthorLinkProps): React.ReactElement => {
    const link = (
      <Link href={'/authors/[authorId]'} as={`/authors/${username}`}>
        <a className={style.underline}>{fullname}</a>
      </Link>
    )
    return (
      <>
        <p>Written by {link}</p>
      </>
    )
  }

  return (
    <>
      <Jumbotron
        height={'60vh'}
        width={'100vw'}
        background={
          <div className="">
            <Image src={article.jumbotron.url} layout='fill' objectFit='cover' objectPosition='center' />
          </div>
        }
        foreground={<div className="h-full w-full overflow-hidden" />}
      />
      <div className="relative max-w-5xl -mt-20 mx-auto px-4 mb-0 pb-10">
        <div>
          <Card>
            <div className="p-4 md:p-8 lg:p-14">
              <h1 className="my-3 text-3xl">{article.title}</h1>
              <TagSet className={style.tagset}>
                {article.tags.map((tag) => (
                  <Tag name={tag} link={`/tags/${tag}`} key={tag} />
                ))}
              </TagSet>
              <div>
                <span className={style.subText}>
                  {`Published on ${new Date(
                    article.publishedDate
                  ).toLocaleDateString('en')}`}
                </span>
              </div>
              <div className={style.details}>
                  <div>
                    <span className={style.subText}>
                      <AuthorLink
                        username={author.username}
                        fullname={author.fullName}
                      />
                    </span>
                  </div>
                  <div>
                    {!article.editedDate ? null : (
                      <span className={style.subText}>
                        {`Last edited on ${new Date(
                          article.editedDate
                        ).toLocaleDateString('en')}`}
                      </span>
                    )}
                  </div>
                  <div>
                    <span className={style.subText}>
                      {article.readTime}
                    </span>
                  </div>
              </div>
              <div style={{ marginTop: '5px' }}></div>
              {children}
            </div>
          </Card>
        </div>
      </div>
    </>
  )
}

export default Article
