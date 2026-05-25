import React, { type PropsWithChildren, type ReactElement } from 'react'
import Figure from '@/components/Figure'

export interface EquationProps {
  caption?: string
  source?: string
  /**
   * `wide` is the default. `bleed` for very large derivations.
   */
  tier?: 'wide' | 'bleed'
}

/**
 * Wraps a block expression in the Figure frame, using the separate
 * equation counter (EQ.01..EQ.N).
 *
 * MDX usage:
 *   <Equation caption="Centripetal force">{`F = \\\\frac{m v^2}{r}`}</Equation>
 *
 * For inline math, keep the standard `$...$` rehype-katex pipeline; this
 * component is for block math you want numbered.
 */
const Equation = ({
  caption,
  source,
  tier = 'wide',
  children,
}: PropsWithChildren<EquationProps>): ReactElement => {
  return (
    <Figure kind="equation" tier={tier} caption={caption} source={source}>
      <div className="bg-bg-deep py-6 px-8 text-text font-serif text-lg overflow-x-auto">
        {children}
      </div>
    </Figure>
  )
}

export default Equation
