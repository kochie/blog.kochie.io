import React from 'react'
import { GetStaticProps } from 'next'
import Image from 'next/image'
import { Jumbotron, Gallery, Page, Heading } from '../components'

import style from '../styles/index.module.css'

import articles from '../../public/articles.json'
// eslint-disable-next-line import/no-unresolved
import { Article } from 'articles.json'

const logo = '/images/icons/blog-logo.svg'
// import jumbotron from '../assets/images/jumbotron.png'
// import jumbotron from 'src/assets/images/alexandre-debieve-FO7JIlwjOtU-unsplash.jpg'
const jumbotron = '/images/umberto-jXd2FSvcRr8-unsplash.jpg'
// import Theme from 'src/components/Theme'

interface ArticleProps {
  articles: Article[]
}

export const getStaticProps: GetStaticProps = async () => {
  const newArticlesPromise = articles.map(async (article) => {
    // const jumbotron = (
    //   await import(`articles/${article.articleDir}/${article.jumbotron.src}`)
    // ).default

    const url = `/articles/${article.articleDir}/${article.jumbotron.src}`

    // const url = jumbotron.url
    // const lqip = jumbotron.lqip

    return { ...article, jumbotron: { url, /*lqip,*/ ...article.jumbotron } }
  })

  const newArticles = await Promise.all(newArticlesPromise)
  return { props: { articles: newArticles } }
}

const Index = ({ articles }: ArticleProps): React.ReactElement => {
  // const [cards, setCards] = useState<Article[]>([])

  // async function getArticles() {
  //   setCards(articles)
  // }

  // useEffect(() => {
  //   getArticles()
  // })

  return (
    <>
      {/* <NextSeo
                config={{
                    title: "Kochie Engineering",
                    description: "I'm Rob, this is my blog about software and ECSE engineering, and other things I find interesting!",
                    locale: "en_AU"
                }}
            /> */}
      <Heading title={'Kochie Engineering'} />
      <Page>
        <>
          <Jumbotron
            // width={'100vw'}
            height={'100vh'}
            background={
              <div className={style.image}>
                <Image
                  src={jumbotron}
                  layout={"fill"}
                  objectFit={"cover"}
                  // lqip={jumbotron.lqip}
                  // width={1000}
                  // height={1000}
                  // style={{ backgroundColor: 'black' }}
                  // alt={'jumbotron background'}
                />
              </div>
            }
            foreground={
              <div className={style.titles}>
                <div>
                  <Image
                    width={192}
                    height={192}
                    src={logo}
                    alt={'logo - kochie engineering'}
                  />
                </div>
                <div className={style.titleRight}>
                  <h1>{'Kochie Engineering'}</h1>
                  <h2>{'Robert Koch'}</h2>
                </div>
              </div>
            }
          />
          <Gallery articles={articles} />
        </>
      </Page>
    </>
  )
}

export default Index
