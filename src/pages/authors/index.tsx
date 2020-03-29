import { Jumbotron, Card, Image, Page, Heading } from '../../components'
import authors from '../../../public/authors.json'
import { Author as AuthorMetadata } from 'authors.json'
import styles from '../../styles/list.module.scss'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { library } from '@fortawesome/fontawesome-svg-core'
import { fab } from '@fortawesome/free-brands-svg-icons'
import { fal } from '@fortawesome/pro-light-svg-icons'
import Link from 'next/link'
import { GetStaticProps } from 'next'

library.add(fab, fal)

// import avatarStyles from '../../styles/author.less'

interface AuthorProps {
  authors: AuthorMetadata[]
}

function smButton(sm: import('authors.json').SocialMedia): JSX.Element {
  return (
    <a
      key={sm.name}
      href={sm.link}
      className={styles.mediaIcon}
      onMouseEnter={event => {
        event.currentTarget.style.color = sm.color
        event.currentTarget.style.transform = 'scale(1.2)'
      }}
      onMouseLeave={event => {
        event.currentTarget.style.color = ''
        event.currentTarget.style.transform = 'scale(1)'
      }}
    >
      <FontAwesomeIcon icon={sm.icon} size={'lg'} className={styles.icon} />
    </a>
  )
}

const Authors = ({ authors }: AuthorProps) => {
  return (
    <>
      <Heading title={'Authors'} />
      <Page>
        <div>
          <Jumbotron
            width={'100vw'}
            height={'60vh'}
            background={<div className={styles.jumbotronBackground} />}
            foreground={
              <div className={styles.jumbotronHeading}>
                <h1>Authors</h1>
              </div>
            }
          />

          <div className={styles.listContainer}>
            {authors.map((author, i) => {
              return i % 2 === 0 ? (
                <Card key={author.username}>
                  <div
                    className={[
                      styles.cardContainer,
                      styles.cardContainerPadding,
                    ].join(' ')}
                  >
                    <Link
                      href={'/authors/[authorId]'}
                      as={`/authors/${author.username}`}
                    >
                      <a>
                        <Image
                          width={120}
                          height={120}
                          {...author.avatar}
                          alt={`${author.fullName} Avatar`}
                          className={[styles.avatar].join(' ')}
                        />
                      </a>
                    </Link>

                    <div className={styles.info}>
                      <div className={styles.topLine}>
                        <h1>
                          <Link
                            href={'/authors/[authorId]'}
                            as={`/authors/${author.username}`}
                          >
                            <a>{author.fullName}</a>
                          </Link>
                        </h1>
                        <div className={styles.socialMediaContainer}>
                          {author.socialMedia.map(sm => smButton(sm))}
                          {smButton({
                            name: 'email',
                            link: 'mailto:robert@kochie.io',
                            icon: ['fal', 'envelope'],
                            color: 'red',
                          })}
                        </div>
                      </div>
                      <p>{author.bio}</p>
                    </div>
                  </div>
                </Card>
              ) : (
                <Card key={author.username}>
                  <div
                    className={[
                      styles.cardContainerReverse,
                      styles.cardContainerPadding,
                    ].join(' ')}
                  >
                    <Link
                      href={'/authors/[authorId]'}
                      as={`/authors/${author.username}`}
                    >
                      <a>
                        <Image
                          width={120}
                          height={120}
                          {...author.avatar}
                          alt={`${author.fullName} Avatar`}
                          className={[styles.avatar].join(' ')}
                        />
                      </a>
                    </Link>

                    <div className={styles.infoOdd}>
                      <div className={styles.topLineReverse}>
                        <h1>
                          <Link
                            href={'/authors/[authorId]'}
                            as={`/authors/${author.username}`}
                          >
                            <a>{author.fullName}</a>
                          </Link>
                        </h1>
                        <div className={styles.socialMediaContainer}>
                          {author.socialMedia.map(sm => smButton(sm))}
                          {smButton({
                            name: 'email',
                            link: 'mailto:robert@kochie.io',
                            icon: ['fal', 'envelope'],
                            color: 'red',
                          })}
                        </div>
                      </div>
                      <p>{author.bio}</p>
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

// Authors.getInitialProps = () => {
//   return { authors }
// }

export const getStaticProps: GetStaticProps = async () => {
  return { props: { authors } }
}

export default Authors
