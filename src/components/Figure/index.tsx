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

export interface FigureProps {
  kind: FigureKind
  tier?: FigureTier
  caption?: string
  source?: string
  className?: string
}

const tierClass: Record<FigureTier, string> = {
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
  if (!caption && !source) return null
  const isEquation = kind === 'equation'
  const n = isEquation ? equationN : figureN
  const prefix = isEquation ? 'EQ.' : 'FIG.'
  const padded = String(n).padStart(2, '0')
  return (
    <figcaption className="mt-3 font-mono text-meta text-text-soft tracking-wide">
      {caption ? (
        <span>
          <span className="text-accent mr-2">
            {prefix} {padded}
          </span>
          {caption}
        </span>
      ) : null}
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
  children,
}: PropsWithChildren<FigureProps>): ReactElement => {
  return (
    <figure
      className={clsx('mx-auto my-10', tierClass[tier], className)}
      data-figure-kind={kind}
    >
      <div className="border border-rule rounded-md overflow-hidden bg-bg-soft">
        {children}
      </div>
      <FigureCaption kind={kind} caption={caption} source={source} />
    </figure>
  )
}

export default Figure
