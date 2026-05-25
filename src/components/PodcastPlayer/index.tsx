'use client'

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type KeyboardEvent,
} from 'react'
import { trackEvent } from 'fathom-client'

interface PodcastPlayerProps {
  audio: string
  /**
   * Pre-declared duration in mm:ss or hh:mm:ss. Renders before the audio
   * metadata loads to avoid a layout shift on first paint.
   */
  duration?: string
  /** Article title — used for the `aria-label` and analytics events. */
  title: string
}

const PLAYBACK_RATES = [1, 1.5, 2] as const
type PlaybackRate = (typeof PLAYBACK_RATES)[number]

const formatTime = (seconds: number): string => {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00'
  const total = Math.floor(seconds)
  const h = Math.floor(total / 3600)
  const m = Math.floor((total % 3600) / 60)
  const s = total % 60
  const pad = (n: number) => String(n).padStart(2, '0')
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`
}

const PlayIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden focusable="false">
    <path d="M3 1v12l10-6z" fill="currentColor" />
  </svg>
)

const PauseIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden focusable="false">
    <rect x="3" y="2" width="3" height="10" fill="currentColor" />
    <rect x="8" y="2" width="3" height="10" fill="currentColor" />
  </svg>
)

export default function PodcastPlayer({
  audio,
  duration,
  title,
}: PodcastPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [loadedDuration, setLoadedDuration] = useState<number | null>(null)
  const [rate, setRate] = useState<PlaybackRate>(1)

  // Keep the audio element's playbackRate in sync when the user cycles speed.
  useEffect(() => {
    if (audioRef.current) audioRef.current.playbackRate = rate
  }, [rate])

  const togglePlay = useCallback(() => {
    const el = audioRef.current
    if (!el) return
    if (el.paused) {
      el.play()
      trackEvent('PODCAST_PLAY')
    } else {
      el.pause()
    }
  }, [])

  const cycleRate = useCallback(() => {
    setRate((current) => {
      const i = PLAYBACK_RATES.indexOf(current)
      return PLAYBACK_RATES[(i + 1) % PLAYBACK_RATES.length]
    })
  }, [])

  const handleSeek = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const el = audioRef.current
    if (!el || !Number.isFinite(el.duration)) return
    const next = (Number(e.target.value) / 1000) * el.duration
    el.currentTime = next
    setCurrentTime(next)
  }, [])

  const handleScrubKey = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      // Native range supports arrow keys; the audio currentTime is updated via
      // the onChange handler firing on each keystroke. Nothing special needed.
      if (e.key === ' ') {
        e.preventDefault()
        togglePlay()
      }
    },
    [togglePlay]
  )

  const totalDisplay = useMemo(() => {
    if (loadedDuration !== null) return formatTime(loadedDuration)
    if (duration) return duration
    return '--:--'
  }, [loadedDuration, duration])

  const sliderValue =
    loadedDuration && loadedDuration > 0
      ? Math.round((currentTime / loadedDuration) * 1000)
      : 0

  return (
    <div
      className="mt-6 mb-2 border-y border-rule py-5"
      aria-label={`Audio version of ${title}`}
    >
      <div className="font-mono text-meta text-text-soft tracking-wide mb-3">
        <span className="text-accent mr-2">{'// '}</span>
        LISTEN
      </div>
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={togglePlay}
          aria-label={isPlaying ? 'Pause audio' : 'Play audio'}
          aria-pressed={isPlaying}
          className="shrink-0 inline-flex items-center justify-center w-11 h-11 rounded-full bg-bg-soft border border-rule text-text hover:bg-accent hover:text-bg-deep hover:border-accent transition-colors duration-fast"
        >
          {isPlaying ? <PauseIcon /> : <PlayIcon />}
        </button>
        <input
          type="range"
          min={0}
          max={1000}
          value={sliderValue}
          onChange={handleSeek}
          onKeyDown={handleScrubKey}
          aria-label="Seek"
          className="flex-1 h-1 accent-accent cursor-pointer"
        />
        <div className="shrink-0 font-mono text-meta text-text-soft tracking-wide tabular-nums">
          <span className="text-text">{formatTime(currentTime)}</span>
          <span className="mx-1 text-rule" aria-hidden>
            /
          </span>
          {totalDisplay}
        </div>
        <button
          type="button"
          onClick={cycleRate}
          aria-label={`Playback speed ${rate}x`}
          className="shrink-0 font-mono text-meta text-text-soft tracking-wide hover:text-accent transition-colors duration-fast tabular-nums w-11 text-right"
        >
          {rate}×
        </button>
      </div>
      <audio
        ref={audioRef}
        src={audio}
        preload="metadata"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => setIsPlaying(false)}
        onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
        onLoadedMetadata={(e) => {
          const d = e.currentTarget.duration
          if (Number.isFinite(d)) setLoadedDuration(d)
        }}
      />
    </div>
  )
}
