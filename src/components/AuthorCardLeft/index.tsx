import Image from 'next/image'
import { Author } from 'types/metadata'
import { SocialMediaButton } from '@/components'

/**
 * Sits at the foot of every article. The Field Journal author block: a
 * mono "WRITTEN BY" label rule-divider above, an avatar pinned to a
 * portrait of the writer, and a serif name with social links and bio.
 * Aligned to the prose column so it threads naturally out of the body
 * copy.
 */
export default function AuthorCardLeft({ author }: { author: Author }) {
  return (
    <aside className="mx-auto max-w-prose px-4 mt-16 mb-12">
      <div className="border-t border-rule pt-8">
        <div className="font-mono text-meta text-text-soft tracking-wide mb-5">
          <span className="text-accent mr-2">{'// '}</span>
          WRITTEN BY
        </div>
        <div className="flex flex-col sm:flex-row sm:items-start gap-5">
          <div className="relative w-20 h-20 shrink-0 rounded-full overflow-hidden ring-1 ring-rule">
            <Image
              fill
              sizes="80px"
              src={`/images/authors/${author.avatar.src}`}
              alt={`${author.fullName} portrait`}
              placeholder={author.avatar.lqip ? 'blur' : 'empty'}
              blurDataURL={author.avatar.lqip || ''}
              style={{ objectFit: 'cover' }}
            />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-baseline gap-x-4 gap-y-2 mb-3">
              <h2 className="font-serif font-semibold text-h3 text-text leading-tight">
                {author.fullName}
              </h2>
              <div className="flex flex-wrap items-center gap-1 text-text-soft">
                {author.socialMedia.map((sm) => (
                  <SocialMediaButton sm={sm} key={sm.name} />
                ))}
              </div>
            </div>
            <p className="font-serif text-base text-text-mute leading-snug">
              {author.bio}
            </p>
          </div>
        </div>
      </div>
    </aside>
  )
}
