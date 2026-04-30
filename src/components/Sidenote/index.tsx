'use client'

import React, { useId, type PropsWithChildren } from 'react'

interface SidenoteProps {
  /**
   * Sequential reference number shown as the inline marker (1, 2, 3, …).
   * Authors number their own notes; this component does not auto-number.
   */
  n: number
}

/**
 * Inline-marker / margin-note component.
 *
 * Layout strategy:
 * - Above the `lg:` breakpoint, the note sits in the right margin (`md:` and
 *   below show it inline as a disclosure).
 * - The inline marker (`sup`) and the note (`aside`) are linked via
 *   `aria-describedby` so screen readers announce both.
 *
 * Authors mark their own numbers. Auto-numbering would couple this to the
 * Figure counter system, which is wrong (footnotes and figures are different
 * editorial categories).
 */
const Sidenote = ({
  n,
  children,
}: PropsWithChildren<SidenoteProps>): React.ReactElement => {
  const id = `sidenote-${useId().replace(/:/g, '')}`
  return (
    <>
      <sup
        aria-describedby={id}
        className="text-accent font-mono text-[0.7em] mx-0.5"
      >
        {n}
      </sup>
      <aside
        id={id}
        className="block lg:absolute lg:right-0 lg:translate-x-full lg:w-56 lg:ml-8 my-3 lg:my-0 p-3 lg:p-0 rounded lg:rounded-none bg-bg-soft lg:bg-transparent border lg:border-l-2 border-rule lg:border-accent lg:pl-3 font-mono text-meta text-text-mute leading-relaxed"
      >
        <span className="text-accent mr-2">{n}</span>
        {children}
      </aside>
    </>
  )
}

export default Sidenote
