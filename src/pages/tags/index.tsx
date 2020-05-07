import { Jumbotron, Card, Image, Page, Heading } from '../../components'

// import authors from '../../static/authors.json'

// import { Author as AuthorMetadata } from 'authors.json'

import articles from '../../../public/articles.json'
import tags from '../../../public/tags.json'
import styles from '../../styles/list.module.scss'

// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

// import { library } from '@fortawesome/fontawesome-svg-core'

// import { fab } from '@fortawesome/free-brands-svg-icons'

// import { fal } from '@fortawesome/pro-light-svg-icons'

import Link from 'next/link'
import { GetStaticProps } from 'next'
// import Head from 'next/head'
// import { GetStaticProps, GetStaticPaths } from 'next'

// library.add(fab, fal)

// import avatarStyles from '../../styles/author.less'

interface TagProps {
  tags: {
    articleCount: number
    name: string
    blurb: string
    image: {
      lqip: string
      url: string
    }
  }[]
}

const Tags = ({ tags }: TagProps) => {
  return (
    <>
      <Heading title={'Tags'} />
      <Page>
        <div>
          <Jumbotron
            width={'100vw'}
            height={'60vh'}
            background={<div className={styles.jumbotronBackground} />}
            foreground={
              <div className={styles.jumbotronHeading}>
                <h1>Tags</h1>
              </div>
            }
          />

          <div className={styles.listContainer}>
            {tags.map((tag, i) => {
              return i % 2 == 0 ? (
                <Card key={tag.name}>
                  <div className={styles.cardContainer}>
                    <Link href={'/tags/[tagId]'} as={`/tags/${tag.name}`}>
                      <a className={styles.imageLink}>
                        <Image
                          // width={'100%'}
                          height={120}
                          // {...tag.image}
                          lqip={tag.image.lqip}
                          src={tag.image.url}
                          alt={`${tag.name} tag`}
                          className={[styles.tagIcon, styles.tagIconLeft].join(
                            ' '
                          )}
                        />
                      </a>
                    </Link>

                    <div className={styles.info}>
                      <div className={styles.topLine}>
                        <h1 className={styles.heading}>
                          <Link href={'/tags/[tagId]'} as={`/tags/${tag.name}`}>
                            <a>{tag.name}</a>
                          </Link>
                        </h1>

                        {/* <div>

                                            {author.socialMedia.map(sm => smButton(sm))}

                                            {smButton({ name: 'email', link: 'mailto:robert@kochie.io', icon: ['fal', 'envelope'], color: 'red' })}

                                        </div> */}
                      </div>

                      <p>{tag.blurb}</p>
                    </div>
                  </div>
                </Card>
              ) : (
                <Card key={tag.name}>
                  <div className={styles.cardContainerReverse}>
                    <Link href={'/tags/[tagId]'} as={`/tags/${tag.name}`}>
                      <a className={styles.imageLink}>
                        <Image
                          // width={'100%'}
                          height={120}
                          lqip={tag.image.lqip}
                          src={tag.image.url}
                          alt={`${tag.name} tag`}
                          className={[styles.tagIcon, styles.tagIconRight].join(
                            ' '
                          )}
                        />
                      </a>
                    </Link>
                    <div className={styles.infoOdd}>
                      <div className={styles.topLineReverse}>
                        <h1 className={styles.heading}>
                          <Link href={'/tags/[tagId]'} as={`/tags/${tag.name}`}>
                            <a>{tag.name}</a>
                          </Link>
                        </h1>
                        {/* <div>

                                            {author.socialMedia.map(sm => smButton(sm))}

                                            {smButton({ name: 'email', link: 'mailto:robert@kochie.io', icon: ['fal', 'envelope'], color: 'red' })}

                                        </div> */}
                      </div>
                      <p>{tag.blurb}</p>
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        </div>
      </Page>
    </>
  )
}

// Tags.getInitialProps = () => {
//   // const tags = new Map<string, number>()
//   const tagsCounted = tags.map(tag => ({
//     ...tag,
//     articleCount: articles.reduce((acc, article) => {
//       return acc + (article.tags.includes(tag.name) ? 1 : 0)
//     }, 0),
//   }))
//   return { tags: tagsCounted }
// }

export const getStaticProps: GetStaticProps = async () => {
  // const tags = new Map<string, number>()
  const tagsCounted = await Promise.all(
    tags.map(async (tag) => ({
      ...tag,
      image: (await import(`src/assets/images/tags/${tag.image.src}`)).default,
      articleCount: articles.reduce((acc, article) => {
        return acc + (article.tags.includes(tag.name) ? 1 : 0)
      }, 0),
    }))
  )

  return { props: { tags: tagsCounted } }
}

export default Tags

// function smButton(sm: import("authors.json").SocialMedia): JSX.Element {

//     return (

//         <a key={sm.name} href={sm.link} className={styles.mediaIcon} onMouseEnter={event => {

//             event.currentTarget.style.color = sm.color;

//             event.currentTarget.style.transform = 'scale(1.2)';

//         }} onMouseLeave={event => {

//             event.currentTarget.style.color = 'black';

//             event.currentTarget.style.transform = 'scale(1)';

//         }}>

//             <FontAwesomeIcon icon={sm.icon} size={'lg'} className={styles.icon} />

//         </a>

//     )

// }
