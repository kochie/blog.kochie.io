import React from 'react'
// import { GetStaticProps } from 'next'
import { join } from 'path'

import Page from '@/components/Page'
// import Heading from '@/components/Heading'
import Jumbotron from '@/components/Jumbotron'
import { lqip } from '@/lib/shrink'

import metadata from '../../../metadata.yaml'
import type { Author } from 'types/metadata'
import { AuthorCardLeft, AuthorCardRight } from '@/components/AuthorCard'

const Authors = async () => {
  const authors = await Promise.all(
    Object.values<Author>(metadata.authors).map(async (author: Author) => {
      const lqipString = await lqip(
        join(process.env.PWD || '', '/public/images/authors', author.avatar.src)
      )
      return { ...author, avatar: { src: author.avatar.src, lqip: lqipString } }
    })
  )

  return (
    <>
      {/* <Heading title={'Authors'} /> */}
      <Page>
        <div>
          <Jumbotron
            width={'100vw'}
            height={'60vh'}
            background={<div className="bg-black w-full h-full" />}
            foreground={
              <div className="text-white h-full w-full flex flex-col justify-center text-center">
                <h1 className="text-4xl">Authors</h1>
              </div>
            }
          />

          <div className="px-5 py-12 -mt-32 max-w-5xl mx-auto grid gap-7">
            {Object.values(authors).map((author: Author, i) => {
              // const avatar = avatars[i]
              return i % 2 === 0 ? (
                <AuthorCardLeft key={author.username} author={author} />
              ) : (
                <AuthorCardRight key={author.username} author={author} />
              )
            })}
          </div>
        </div>
      </Page>
    </>
  )
}

// export const getStaticProps: GetStaticProps = async () => {
//   const authors = await Promise.all(
//     Object.values<Author>(metadata.authors).map(async (author: Author) => {
//       const lqipString = await lqip(
//         join(process.env.PWD || '', '/public/images/authors', author.avatar.src)
//       )
//       return { ...author, avatar: { src: author.avatar.src, lqip: lqipString } }
//     })
//   )
//   return { props: { authors } }
// }

export default Authors
