'use client'

import React, { type PropsWithChildren, type ReactElement } from 'react'
import Figure from '@/components/Figure'

export interface CanvasProps {
  caption?: string
  source?: string
  /**
   * Default 'wide'. Use 'bleed' for full-width interactive scenes that
   * benefit from horizontal space (e.g. a simulation with a side chart).
   */
  tier?: 'wide' | 'bleed'
}

/**
 * Wraps an interactive embed (a `<canvas>` scene, a Three.js mount, an
 * inline D3 chart with controls, etc.) in the unified Figure frame with
 * a small "// interactive" marker top-left to cue the reader.
 *
 * Spec §11.2 (kind="canvas").
 */
const Canvas = ({
  caption,
  source,
  tier = 'wide',
  children,
}: PropsWithChildren<CanvasProps>): ReactElement => (
  <Figure kind="canvas" tier={tier} caption={caption} source={source}>
    <div className="relative bg-bg-deep p-4">
      <div
        aria-hidden
        className="absolute top-2 left-3 font-mono text-meta tracking-wide text-accent pointer-events-none"
      >
        {'// interactive'}
      </div>
      <div className="pt-6">{children}</div>
    </div>
  </Figure>
)

export default Canvas
