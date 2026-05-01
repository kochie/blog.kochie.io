'use client'

import React, { type PropsWithChildren, type ReactElement } from 'react'
import clsx from 'clsx'
import { useFigureNumber, useEquationNumber } from './context'

type FigureKind =
  | 'image'
  | 'code'
  | 'video'
  | 'tweet'
  | 'linkedin'
  | 'spotify'
  | 'github'
  | 'equation'
  | 'canvas'
  | 'quote'

type FigureTier = 'prose' | 'wide' | 'bleed'

type FigureFrame = 'fit' | 'fill'

export interface FigureProps {
  kind: FigureKind
  tier?: FigureTier
  caption?: string
  source?: string
  className?: string
  /**
   * `fit` (default for kind="image") shrink-wraps the bordered frame to its
   * content so a small SVG or smaller-than-tier raster doesn't sit inside a
   * dark, oversized frame. `fill` (default for everything else) lets the
   * frame span the tier width — needed for code blocks, embeds, and hero
   * images that use next/image's `fill` mode.
   */
  frame?: FigureFrame
}

// Article body is a page-centred 3-col grid (TOC | content | spacer), so
// the content column itself is page-centred. Prose and wide figures fit
// inside the column and just need `mx-auto max-w-{tier}` to centre. Bleed
// figures exceed the column width, so they use the viewport-breakout
// pattern (`relative left-1/2 -translate-x-1/2 w-screen`) to escape the
// column and centre on the viewport, with an inner wrapper re-applying
// `max-w-bleed` to keep content bounded.
const breakoutClass: Record<FigureTier, string> = {
  prose: '',
  wide: '',
  bleed: 'xl:relative xl:left-1/2 xl:-translate-x-1/2 xl:w-screen',
}

const maxWidthClass: Record<FigureTier, string> = {
  prose: 'max-w-prose',
  wide: 'max-w-wide',
  bleed: 'max-w-bleed',
}

const FigureCaption = ({
  kind,
  caption,
  source,
}: Pick<FigureProps, 'kind' | 'caption' | 'source'>) => {
  // Numbers must be requested unconditionally to keep hook order stable.
  const figureN = useFigureNumber()
  const equationN = useEquationNumber()
  const isEquation = kind === 'equation'
  const n = isEquation ? equationN : figureN
  // n === 0 means there's no FigureProvider in scope — suppress the caption
  // so we don't emit a meaningless "FIG. 00".
  if (n === 0) return null
  const prefix = isEquation ? 'EQ.' : 'FIG.'
  const padded = String(n).padStart(2, '0')
  return (
    <figcaption className="mt-3 font-mono text-meta text-text-soft tracking-wide">
      <span>
        <span className="text-accent mr-2">
          {prefix} {padded}
        </span>
        {caption}
      </span>
      {source ? (
        <span className="block mt-1 text-text-soft/80">{source}</span>
      ) : null}
    </figcaption>
  )
}

export const Figure = ({
  kind,
  tier = kind === 'image' || kind === 'quote' ? 'prose' : 'wide',
  caption,
  source,
  className,
  frame = kind === 'image' ? 'fit' : 'fill',
  children,
}: PropsWithChildren<FigureProps>): ReactElement => {
  return (
    <figure
      className={clsx('my-10', breakoutClass[tier], className)}
      data-figure-kind={kind}
      data-tier={tier}
    >
      <div
        className={clsx(
          'mx-auto',
          maxWidthClass[tier],
          tier === 'bleed' && 'px-4 xl:px-0'
        )}
      >
        {frame === 'fit' ? (
          // Wrap frame and caption in a fit-content container so the caption
          // sits flush with the frame's left edge instead of stretching to
          // tier width. Inside the frame, `p-2` reveals a small bg-bg-soft
          // matte between the rule border and the image's dark surface — a
          // print-mat detail that keeps the image from butting against the
          // border.
          <div className="w-fit max-w-full mx-auto">
            <div className="border border-rule rounded-md overflow-hidden bg-bg-soft p-2">
              {children}
            </div>
            <FigureCaption kind={kind} caption={caption} source={source} />
          </div>
        ) : (
          <>
            <div className="border border-rule rounded-md overflow-hidden bg-bg-soft">
              {children}
            </div>
            <FigureCaption kind={kind} caption={caption} source={source} />
          </>
        )}
      </div>
    </figure>
  )
}

export default Figure
