'use client'

import { useWindowSize } from '@uidotdev/usehooks'
import { Tweet as RawTweet } from 'react-tweet'
import Figure from '@/components/Figure'
import Canvas from '@/components/Canvas'
import RingSpinner from '@/components/Canvasses/ring-spinner'
import clsx from 'clsx'
import type { DetailedHTMLProps, VideoHTMLAttributes } from 'react'

interface LinkedInEmbedProps {
  url: string
  width?: number
  height?: number
  caption?: string
  tier?: 'prose' | 'wide' | 'bleed'
}

export function LinkedInEmbed({
  url,
  width = 504,
  height = 573,
  caption,
  tier = 'wide',
}: LinkedInEmbedProps) {
  const { width: windowWidth } = useWindowSize()
  return (
    <Figure kind="linkedin" tier={tier} caption={caption}>
      <div className="flex justify-center bg-bg-deep p-4">
        <iframe
          src={url}
          width={Math.min((windowWidth ?? Infinity) - 60, width)}
          height={height}
          allowFullScreen
          title="LinkedIn post"
          className="rounded-md border border-rule"
        />
      </div>
    </Figure>
  )
}

interface TweetProps {
  id: string
  caption?: string
  tier?: 'prose' | 'wide' | 'bleed'
}

export const Tweet = ({ id, caption, tier = 'wide' }: TweetProps) => (
  <Figure kind="tweet" tier={tier} caption={caption}>
    <RawTweet id={id} />
  </Figure>
)

interface VideoProps extends DetailedHTMLProps<
  VideoHTMLAttributes<HTMLVideoElement>,
  HTMLVideoElement
> {
  caption?: string
  tier?: 'prose' | 'wide' | 'bleed'
}

export const Video = ({
  caption,
  tier = 'wide',
  className,
  ...props
}: VideoProps) => (
  <Figure kind="video" tier={tier} caption={caption}>
    <div className="flex justify-center bg-bg-deep p-4">
      <video
        {...props}
        className={clsx('block max-w-full h-auto', className)}
      />
    </div>
  </Figure>
)

interface YouTubeProps {
  /**
   * The YouTube video id (the part after `v=` or `youtu.be/`). E.g. for
   * `https://youtu.be/bJ_seXo-Enc`, pass `bJ_seXo-Enc`.
   */
  id: string
  caption?: string
  source?: string
  tier?: 'prose' | 'wide' | 'bleed'
  /** Optional title for accessibility — defaults to a generic label. */
  title?: string
  /** Start time in seconds (forwarded to YouTube as `?start=`). */
  start?: number
}

/**
 * YouTube embed with the same Figure framing as Video / Tweet / LinkedIn.
 * Lets authors write `<YouTube id="..." caption="..." />` instead of an
 * inline iframe (which bypasses the MDX component map and therefore the
 * figure frame).
 */
export const YouTube = ({
  id,
  caption,
  source,
  tier = 'wide',
  title = 'YouTube video player',
  start,
}: YouTubeProps) => {
  const params = start ? `?start=${Math.max(0, Math.floor(start))}` : ''
  const src = `https://www.youtube.com/embed/${id}${params}`
  return (
    <Figure kind="video" tier={tier} caption={caption} source={source}>
      <div
        className="relative w-full bg-bg-deep"
        style={{ aspectRatio: '16 / 9' }}
      >
        <iframe
          src={src}
          title={title}
          loading="lazy"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          className="absolute inset-0 w-full h-full"
        />
      </div>
    </Figure>
  )
}

interface HaloInteractiveProps {
  caption?: string
  tier?: 'wide' | 'bleed'
}

/**
 * The Halo physics simulation. Wrapped in Canvas so it inherits the
 * unified figure frame (with the "// interactive" marker, FIG number,
 * and caption convention).
 */
export const HaloInteractive = ({
  caption,
  tier = 'bleed',
}: HaloInteractiveProps) => (
  <Canvas tier={tier} caption={caption}>
    <RingSpinner />
  </Canvas>
)
