'use client'

import React, {
  createContext,
  useContext,
  useId,
  useRef,
  useState,
  type PropsWithChildren,
  type ReactElement,
} from 'react'

interface FigureCounters {
  numberFor: (kind: 'figure' | 'equation', id: string) => number
}

const FigureContext = createContext<FigureCounters | null>(null)

/**
 * Scopes figure and equation numbering. Wrap an article in this so each
 * article restarts at FIG.01 / EQ.01.
 *
 * Numbering is keyed by useId() per consumer so that a given component
 * instance gets the same number across re-renders, including React
 * StrictMode's double-mount in dev. The map is the source of truth: the
 * first call for a (kind, id) pair assigns a fresh number, subsequent
 * calls return the cached value.
 */
const FigureProvider = ({
  children,
}: PropsWithChildren<Record<never, never>>): ReactElement => {
  const mapRef = useRef<{
    figure: Map<string, number>
    equation: Map<string, number>
    figureCounter: number
    equationCounter: number
  }>({
    figure: new Map(),
    equation: new Map(),
    figureCounter: 0,
    equationCounter: 0,
  })

  const value: FigureCounters = {
    numberFor: (kind, id) => {
      const m = mapRef.current
      const map = kind === 'figure' ? m.figure : m.equation
      const cached = map.get(id)
      if (cached !== undefined) return cached
      const counterKey = kind === 'figure' ? 'figureCounter' : 'equationCounter'
      const next = ++m[counterKey]
      map.set(id, next)
      return next
    },
  }

  return (
    <FigureContext.Provider value={value}>{children}</FigureContext.Provider>
  )
}

/**
 * Returns a stable figure number for this component instance.
 * Outside a FigureProvider this returns 0 — meant to surface misuse rather
 * than crash, since MDX may render embeds in unexpected contexts.
 */
const useFigureNumber = (): number => {
  const ctx = useContext(FigureContext)
  const id = useId()
  const [n] = useState(() => (ctx ? ctx.numberFor('figure', id) : 0))
  return n
}

const useEquationNumber = (): number => {
  const ctx = useContext(FigureContext)
  const id = useId()
  const [n] = useState(() => (ctx ? ctx.numberFor('equation', id) : 0))
  return n
}

export { FigureProvider, useFigureNumber, useEquationNumber }
