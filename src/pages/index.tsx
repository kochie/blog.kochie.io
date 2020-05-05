/* eslint-disable @typescript-eslint/explicit-function-return-type */
import React from 'react'
import { Jumbotron, Gallery, Image, Page, Heading } from '../components'
// import Head from 'next/head'
import style from '../styles/index.module.scss'
import articles from '../../public/articles.json'
import { Article } from 'articles.json'
import { GetStaticProps } from 'next'
// import Jimp from 'jimp/es'
// import { encode } from 'blurhash'
import {} from 'path'
import { logo, jumbotron } from 'src/lib/images'

// const theme = {
//   palette: {
//     primary: '#741616',
//     secondary: '#2e0014',
//   },
// }

interface ArticleProps {
  articles: Article[]
}

export const getStaticProps: GetStaticProps = async () => {
  // const p = articles.map(async article => {
  //   console.log(process.cwd())
  //   const imagesrc = article.jumbotron.src
  //   const img = await Jimp.read(`${process.cwd()}/public/${imagesrc}`)

  //   const hash = encode(new Uint8ClampedArray(img.bitmap.data), img.bitmap.width, img.bitmap.height, 4, 4)
  //   article.jumbotron.lqip = hash
  // })

  // await Promise.all(p).catch(err => {
  //   console.error(err)
  // })
  return { props: { articles } }
}

export default ({ articles }: ArticleProps): React.ReactElement => {
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
                  {...jumbotron}
                  width={'100vw'}
                  height={'100vh'}
                  style={{ backgroundColor: 'black' }}
                  alt={'jumbotron background'}
                />
              </div>
            }
            foreground={
              <div className={style.titles}>
                <div>
                  <img
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
