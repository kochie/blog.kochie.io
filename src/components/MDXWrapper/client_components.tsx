'use client'

import { useWindowSize } from '@uidotdev/usehooks'
import { Tweet as RawTweet } from 'react-tweet'
import Figure from '@/components/Figure'
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
    <video {...props} className={clsx('block w-full h-auto', className)} />
  </Figure>
)
