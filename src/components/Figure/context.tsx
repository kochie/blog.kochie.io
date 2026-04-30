'use client'

import React, {
  createContext,
  useContext,
  useRef,
  useState,
  type PropsWithChildren,
  type ReactElement,
} from 'react'

interface FigureCounters {
  nextFigure: () => number
  nextEquation: () => number
}

const FigureContext = createContext<FigureCounters | null>(null)

/**
 * Scopes figure and equation numbering. Wrap an article in this so each
 * article restarts at FIG.01 / EQ.01. Mounting two providers (e.g. a
 * preview + main) gives them independent counters by design.
 */
const FigureProvider = ({
  children,
}: PropsWithChildren<Record<never, never>>): ReactElement => {
  const figRef = useRef(0)
  const eqRef = useRef(0)
  const value: FigureCounters = {
    nextFigure: () => ++figRef.current,
    nextEquation: () => ++eqRef.current,
  }
  return (
    <FigureContext.Provider value={value}>{children}</FigureContext.Provider>
  )
}

/**
 * Returns the next figure number, captured once per component instance
 * via useState's lazy initializer. Subsequent renders of the same instance
 * return the same number. Outside a FigureProvider this returns 0 — meant
 * to surface misuse rather than crash, since MDX may render embeds in
 * unexpected contexts.
 */
const useFigureNumber = (): number => {
  const ctx = useContext(FigureContext)
  const [n] = useState(() => (ctx ? ctx.nextFigure() : 0))
  return n
}

const useEquationNumber = (): number => {
  const ctx = useContext(FigureContext)
  const [n] = useState(() => (ctx ? ctx.nextEquation() : 0))
  return n
}

export { FigureProvider, useFigureNumber, useEquationNumber }
