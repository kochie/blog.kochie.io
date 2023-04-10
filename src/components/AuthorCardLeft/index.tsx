import Image from 'next/image'
import Link from 'next/link'
import { Author } from 'types/metadata'
import { Card, SocialMediaButton } from '@/components'

import styles from '@/styles/list.module.css'

export default function AuthorCardLeft({ author }: { author: Author }) {
  return (
    <div className="relative max-w-5xl mx-auto px-4 mb-0 pb-10 mt-10">
      <Card>
        <div className="px-4 md:px-8 lg:px-14 py-5 flex items-center flex-col justify-center md:justify-start md:flex-row group">
          <Link href={`/authors/${author.username}`}>
            <div className="w-32 h-32 relative border-4 border-white border-solid rounded-full md:mr-4 overflow-hidden">
              <div className="relative transition ease-in-out duration-500 filter grayscale-70 group-hover:grayscale-0 w-full h-full">
                <Image
                  width={128}
                  height={128}
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  src={`/images/authors/${author.avatar.src}`}
                  alt={`${author.fullName} Avatar`}
                  placeholder="blur"
                  blurDataURL={author.avatar.lqip || ''}
                  className="transform-gpu group-hover:scale-110 flex-shrink-0 cursor-pointer transition ease-in-out duration-500"
                />
              </div>
            </div>
          </Link>

          <div className="m-4">
            <div className="flex-wrap flex flex-col md:flex-row items-center text-2xl">
              <h1 className={styles.heading}>
                <Link href={`/authors/${author.username}`}>
                  {author.fullName}
                </Link>
              </h1>
              <div className="flex md:ml-4 md:my-0 my-2 gap-1">
                {author.socialMedia.map((sm) => (
                  <SocialMediaButton sm={sm} key={sm.name} />
                ))}
              </div>
            </div>
            <p className="text-center md:text-left mt-2">{author.bio}</p>
          </div>
        </div>
      </Card>
    </div>
  )
}
