import React, { type ReactElement } from 'react'
import KochieLoader from '@/components/KochieLoader'

export interface LoadingProps {
  /** Rendered size of the loader, in px. */
  size?: number
  label?: string
  /**
   * Hold the loader back for this many ms so fast loads never flash it.
   * Done in CSS rather than a timer because Suspense fallbacks are often
   * streamed and painted before hydration.
   */
  delayMs?: number
  className?: string
}

/**
 * Looping K-mark loader — use as a Suspense fallback or `loading.tsx`.
 * Suspense unmounts its fallback instantly, so there is no exit animation.
 */
const Loading = ({
  size = 72,
  label = 'Loading',
  delayMs = 300,
  className,
}: LoadingProps): ReactElement => (
  <div
    role="status"
    aria-live="polite"
    className={`flex items-center justify-center ${className ?? ''}`}
  >
    <style href="kochie-loading" precedence="default">
      {
        '@keyframes kochie-loading-appear{from{opacity:0}to{opacity:1}}.kochie-loading{animation:kochie-loading-appear .2s both}'
      }
    </style>
    <div className="kochie-loading" style={{ animationDelay: `${delayMs}ms` }}>
      <KochieLoader loop size={size} label={label} />
    </div>
  </div>
)

export default Loading
