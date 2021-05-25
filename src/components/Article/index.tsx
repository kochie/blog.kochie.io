import React, {
  PropsWithChildren,
  useCallback,
  useEffect,
  useState,
} from 'react'
import Link from 'next/link'
// import EmailForm from '@/components/EmailForm'
import Jumbotron from '@/components/Jumbotron'
import Card from '@/components/Card'
import { Tag, TagSet } from '@/components/Tag'
import Image from 'next/image'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { findIconDefinition } from '@fortawesome/fontawesome-svg-core'

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

const TopButton = () => {
  const [visible, setVisibility] = useState(false)
  const [atTop, setTop] = useState(true)
  const [pc, setPc] = useState(0)

  const scrollListener = useCallback(() => {
    if (window.scrollY > 0 && atTop) setTop(false)
    if (window.scrollY === 0 && !atTop) setTop(true)

    const p = document.body.parentNode
    if (!p) return
    // @ts-expect-error the definitions seem to be wrong
    setPc(p.scrollTop / (p.scrollHeight - p.clientHeight))
  }, [atTop])

  useEffect(() => {
    window.addEventListener('scroll', scrollListener)

    return () => {
      window.removeEventListener('scroll', scrollListener)
    }
  }, [scrollListener])

  useEffect(() => {
    setVisibility(true)
  }, [])

  return (
    <div className={visible ? 'visible' : 'invisible'}>
      <div
        className={`fixed bottom-6 right-6 h-20 w-20 bg-green-500 rounded-full z-10 group ${
          atTop ? 'animate-bounce-out' : 'animate-bounce-in'
        }`}
      >
        <div style={{ transform: 'rotate(90deg) scaleX(-1)' }}>
          <svg viewBox="0 0 50 50">
            <circle
              className="progress-circle"
              cx="25"
              cy="25"
              r="22"
              fill="transparent"
              stroke="red"
              strokeWidth={6}
              strokeDasharray={138.16}
              strokeDashoffset={138.16 * pc}
            />
          </svg>
        </div>
        <div
          className={`fixed top-2 left-2 bg-white rounded-full h-16 w-16 shadow-2xl fa-stack cursor-pointer`}
          onClick={() => {
            window.scrollTo({ top: 0, behavior: 'smooth' })
          }}
        >
          <FontAwesomeIcon
            icon={findIconDefinition({
              prefix: 'fad',
              iconName: 'arrow-to-top',
            })}
            className="fa-stack-1x group-hover:animate-bounce-orig"
            size="2x"
          />
        </div>
      </div>
    </div>
  )
}

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

const Article = ({
  article,
  author,
  children,
}: PropsWithChildren<ArticleProps>): React.ReactElement => {
  return (
    <>
      <Jumbotron
        height={'60vh'}
        width={'100vw'}
        background={
          <div className="">
            <Image
              src={article.jumbotron.url}
              layout="fill"
              blurDataURL={article.jumbotron.lqip}
              objectFit="cover"
              objectPosition="center"
              placeholder="blur"
              alt={article.jumbotron.alt}
            />
          </div>
        }
        foreground={<div className="h-full w-full overflow-hidden" />}
      />
      <div className="relative max-w-5xl -mt-20 mx-auto px-4 mb-0 pb-10">
        <div>
          <Card>
            <div className="p-4 md:p-8 lg:p-14">
              <h1 className="mt-3 mb-10 text-5xl md:text-left text-center">
                {article.title}
              </h1>
              <TagSet className="md:mb-3 md:-ml-1 justify-center md:justify-start">
                {article.tags.map((tag) => (
                  <Tag name={tag} link={`/tags/${tag}`} key={tag} inverted />
                ))}
              </TagSet>
              <div className="flex flex-col md:flex-row justify-between items-center">
                <div>
                  <span className={style.subText}>
                    {`Published on ${new Date(
                      article.publishedDate
                    ).toLocaleDateString('en')}`}
                  </span>
                </div>
                <div>
                  {article.editedDate == article.publishedDate ? null : (
                    <span className={style.subText}>
                      {`Last edited on ${new Date(
                        article.editedDate
                      ).toLocaleDateString('en')}`}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex flex-col md:flex-row justify-between items-center">
                <span className={style.subText}>
                  <AuthorLink
                    username={author.username}
                    fullname={author.fullName}
                  />
                </span>
                <div>
                  <span className={style.subText}>{article.readTime}</span>
                </div>
              </div>
              <div style={{ marginTop: '5px' }}></div>
              {children}
            </div>
          </Card>
          {/* <EmailForm /> */}
          <TopButton />
        </div>
      </div>
    </>
  )
}

export default Article
export { AuthorLink }
