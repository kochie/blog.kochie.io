'use client'

import { Tweet as RawTweet } from 'react-tweet'
import { Spotify as SpotifyPlayer } from 'react-spotify-embed'
import Figure from '@/components/Figure'
import Canvas from '@/components/Canvas'
import RingSpinner from '@/components/Canvasses/ring-spinner'
import clsx from 'clsx'
import { Component } from 'react'
import type {
  DetailedHTMLProps,
  ErrorInfo,
  ReactNode,
  VideoHTMLAttributes,
} from 'react'

// react-tweet's enrichTweet() crashes when the Twitter/X syndication API
// omits entity arrays (e.g. `entities.symbols`) from the response. Wrap
// the raw Tweet in a class-based error boundary so a single broken tweet
// can't take down the whole article.
class TweetBoundary extends Component<
  { id: string; children: ReactNode },
  { failed: boolean }
> {
  constructor(props: { id: string; children: ReactNode }) {
    super(props)
    this.state = { failed: false }
  }

  static getDerivedStateFromError(_err: unknown) {
    return { failed: true }
  }

  componentDidCatch(err: Error, info: ErrorInfo) {
    console.warn(
      '[TweetBoundary] tweet render failed',
      this.props.id,
      err,
      info
    )
  }

  render() {
    if (this.state.failed) {
      return (
        <a
          href={`https://x.com/i/web/status/${this.props.id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="block text-center py-6 text-accent hover:underline font-mono text-sm"
        >
          View tweet on X →
        </a>
      )
    }
    return this.props.children
  }
}

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
  return (
    <Figure kind="linkedin" tier={tier} caption={caption}>
      <div className="flex justify-center bg-bg-deep p-4">
        <iframe
          src={url}
          style={{ width: `min(calc(100vw - 60px), ${width}px)` }}
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
    <TweetBoundary id={id}>
      <RawTweet id={id} apiUrl={`/api/tweet/${id}`} />
    </TweetBoundary>
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
    <div className="bg-bg-deep p-4">
      <video
        {...props}
        // `w-full` instead of `max-w-full` makes the video fill its tier
        // frame regardless of source pixel dimensions — matching the raster
        // image figures. A narrower source picks up a small browser-side
        // upscale; visual consistency at the tier boundary wins.
        className={clsx('block w-full h-auto', className)}
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

interface SpotifyEmbedProps {
  /**
   * Full Spotify URL for the track, album, playlist, episode, etc.
   * E.g. `https://open.spotify.com/track/0FxL5Tz52WeiymUuQvpGle`
   */
  link: string
  /**
   * Render the wide-layout Spotify player (album art on the left, larger
   * controls). Passed directly to `react-spotify-embed`'s `wide` prop.
   */
  wide?: boolean
}

/**
 * Spotify embed using `react-spotify-embed`. Accepts any Spotify URL
 * (track, album, playlist, podcast episode) and renders it inside the
 * standard Figure frame so it inherits figure numbering and captions.
 */
export const Spotify = ({ link, wide }: SpotifyEmbedProps) => (
  <figure className="my-8 w-full rounded-[12px] overflow-hidden">
    <SpotifyPlayer link={link} wide={wide} width="100%" style={{ display: 'block' }} />
  </figure>
)
