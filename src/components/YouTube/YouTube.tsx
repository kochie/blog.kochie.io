import clsx from 'clsx'
import { resolveYouTubeEmbed } from './resolveYouTubeEmbed'

export type YouTubeProps = {
  /** Video id (`v=` / embed path segment). */
  id?: string
  /** Watch, embed, or youtu.be URL — inferred when `id` is omitted. */
  src?: string
  title?: string
  /** Use youtube-nocookie.com. Auto when `src` is already nocookie. */
  nocookie?: boolean
  /** 9:16 layout for Shorts-style clips. */
  portrait?: boolean
  className?: string
}

export default function YouTube({
  id,
  src,
  title = 'YouTube video',
  nocookie,
  portrait = false,
  className,
}: YouTubeProps) {
  const { embedUrl } = resolveYouTubeEmbed({ id, src, nocookie })

  return (
    <div
      className={clsx(
        'not-prose my-10 w-full max-w-4xl mx-auto',
        portrait && 'max-w-[min(100%,315px)]',
        !portrait && 'px-5',
        className
      )}
    >
      <div
        className={clsx(
          'relative w-full overflow-hidden rounded-xl bg-black shadow-md ring-1 ring-zinc-900/10 dark:ring-zinc-100/10',
          portrait ? 'aspect-[9/16]' : 'aspect-video'
        )}
      >
        <iframe
          className="absolute inset-0 h-full w-full border-0"
          src={embedUrl}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
          loading="lazy"
        />
      </div>
    </div>
  )
}
