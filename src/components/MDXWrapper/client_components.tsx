'use client'

import { useWindowSize } from '@uidotdev/usehooks'
import { Tweet as RawTweet } from 'react-tweet'
import Figure from '@/components/Figure'

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
