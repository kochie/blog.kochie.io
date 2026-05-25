import React from 'react'

/**
 * Keyboard-accessible "skip to main content" link. Visually hidden until
 * focused (via Tab), at which point it becomes a small clay banner at
 * the top-left of the viewport. Activating it focuses the
 * `#main-content` landmark.
 */
const SkipToContent = (): React.ReactElement => (
  <a
    href="#main-content"
    className={[
      'sr-only',
      'focus:not-sr-only',
      'focus:fixed focus:top-2 focus:left-2 focus:z-50',
      'focus:rounded focus:px-4 focus:py-2',
      'focus:bg-accent focus:text-bg',
      'focus:font-mono focus:text-meta focus:tracking-wide',
      'focus:outline-2 focus:outline-offset-2 focus:outline-accent',
    ].join(' ')}
  >
    Skip to main content
  </a>
)

export default SkipToContent
