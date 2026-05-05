'use client'

import clsx from 'clsx'
import { useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { THEME, useTheme } from '@/components/Theme/context'

const newMermaidRenderId = () =>
  `mermaid-${typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : Math.random().toString(36).slice(2)}`

// Field Journal palette — see src/styles/tokens.css for the source of truth.
// Mermaid's `themeVariables` only takes effect under `theme: 'base'`, so
// authors must NOT set an inline `---config: theme: ---` override in their
// fenced source (that would skip these variables and use a stock palette).
const darkThemeVariables = {
  darkMode: true,
  fontFamily: 'var(--font-mono), ui-monospace, SFMono-Regular, monospace',
  // Surfaces — warm soot, not slate.
  background: '#14110E', // bg-deep
  mainBkg: '#232019', // bg-soft
  // Primary nodes carry the clay border that defines every clickable thing
  // on the site, so the eye reads them as the diagram's "links".
  primaryColor: '#232019',
  primaryTextColor: '#F4EFE6',
  primaryBorderColor: '#DA8665', // accent (clay)
  secondaryColor: '#58504A', // steel-warm-700
  secondaryTextColor: '#C9C0B0',
  secondaryBorderColor: '#8C8576',
  tertiaryColor: '#232019',
  tertiaryTextColor: '#F4EFE6',
  tertiaryBorderColor: '#F2DC4A', // signal — reserved for highlight nodes
  lineColor: '#8C8576', // text-soft
  textColor: '#C9C0B0',
  titleColor: '#DA8665', // diagram titles in clay, matching kicker numbers
  noteBkgColor: '#232019',
  noteTextColor: '#C9C0B0',
  noteBorderColor: 'rgba(244, 239, 230, 0.16)',
  edgeLabelBackground: '#14110E',
  // Quadrant chart — uniform near-bg fills so points/title carry the colour.
  quadrant1Fill: '#1A1815',
  quadrant2Fill: '#1A1815',
  quadrant3Fill: '#1A1815',
  quadrant4Fill: '#1A1815',
  quadrant1TextFill: '#C9C0B0',
  quadrant2TextFill: '#C9C0B0',
  quadrant3TextFill: '#C9C0B0',
  quadrant4TextFill: '#C9C0B0',
  quadrantPointFill: '#DA8665',
  quadrantPointTextFill: '#F4EFE6',
  quadrantXAxisTextFill: '#C9C0B0',
  quadrantYAxisTextFill: '#C9C0B0',
  quadrantInternalBorderStrokeFill: 'rgba(244, 239, 230, 0.12)',
  quadrantExternalBorderStrokeFill: '#8C8576',
  quadrantTitleFill: '#DA8665',
  // Multi-series palette (radar curves, pie slices). Mermaid walks
  // cScale0..cScale11 in order, so the first two indices are clay and
  // signal — the brand's two true accents. The rest are warm-Melbourne
  // adjacents (terracotta, ochre, peach, leather, dried rose, sodium
  // amber, plus the heritage orange/red from the K mark) so even a
  // 12-curve chart stays in register and avoids cool blues/greens.
  cScale0: '#DA8665', // clay
  cScale1: '#F2DC4A', // signal
  cScale2: '#B85D7B', // wine rose
  cScale3: '#D9B26B', // wheat ochre
  cScale4: '#E27A5C', // terracotta
  cScale5: '#C9C0B0', // cream (steel-warm-300)
  cScale6: '#E59866', // sodium amber
  cScale7: '#B07759', // leather brown
  cScale8: '#D9B89C', // warm peach
  cScale9: '#A56063', // dried rose
  cScale10: '#8C8576', // mid neutral
  cScale11: '#C34406', // heritage orange (K mark)
}

const lightThemeVariables = {
  darkMode: false,
  fontFamily: 'var(--font-mono), ui-monospace, SFMono-Regular, monospace',
  background: '#ECE2C6', // bg-deep (light)
  mainBkg: '#FAF6E8', // bg-soft (light)
  primaryColor: '#FAF6E8',
  primaryTextColor: '#1A1815',
  primaryBorderColor: '#C46A4A', // accent (light)
  secondaryColor: '#C9C0B0',
  secondaryTextColor: '#1A1815',
  secondaryBorderColor: '#8C8576',
  tertiaryColor: '#FAF6E8',
  tertiaryTextColor: '#1A1815',
  tertiaryBorderColor: '#DBC23A', // signal (light)
  lineColor: '#847A6B',
  textColor: '#4D4538',
  titleColor: '#C46A4A',
  noteBkgColor: '#FAF6E8',
  noteTextColor: '#4D4538',
  noteBorderColor: 'rgba(26, 24, 21, 0.16)',
  edgeLabelBackground: '#ECE2C6',
  quadrant1Fill: '#F4EDD9',
  quadrant2Fill: '#F4EDD9',
  quadrant3Fill: '#F4EDD9',
  quadrant4Fill: '#F4EDD9',
  quadrant1TextFill: '#4D4538',
  quadrant2TextFill: '#4D4538',
  quadrant3TextFill: '#4D4538',
  quadrant4TextFill: '#4D4538',
  quadrantPointFill: '#C46A4A',
  quadrantPointTextFill: '#1A1815',
  quadrantXAxisTextFill: '#4D4538',
  quadrantYAxisTextFill: '#4D4538',
  quadrantInternalBorderStrokeFill: 'rgba(26, 24, 21, 0.12)',
  quadrantExternalBorderStrokeFill: '#847A6B',
  quadrantTitleFill: '#C46A4A',
  // Same series palette as dark, but each hue darkened/saturated so the
  // curves read against the cream paper bg rather than washing out.
  cScale0: '#C46A4A', // clay (light)
  cScale1: '#DBC23A', // signal (light)
  cScale2: '#8E3A57', // wine rose (deep)
  cScale3: '#A8853F', // wheat ochre (deep)
  cScale4: '#B05432', // terracotta (deep)
  cScale5: '#58504A', // steel-warm-700
  cScale6: '#C0814A', // sodium amber
  cScale7: '#7C4F37', // leather brown (deep)
  cScale8: '#B07F5C', // peach (deep)
  cScale9: '#7F4042', // dried rose (deep)
  cScale10: '#8C8576', // mid neutral
  cScale11: '#741516', // heritage red (K mark)
}

export interface MermaidDiagramProps {
  /** Raw Mermaid diagram source (fenced block body). */
  source: string
  className?: string
}

/**
 * Renders Mermaid as an SVG inline element. Callers wrap this in a project
 * `<Figure kind="diagram" />` for the FIG. nn caption + frame — the diagram
 * itself never carries its own figure.
 */
export default function MermaidDiagram({
  source,
  className,
}: MermaidDiagramProps) {
  const hostRef = useRef<HTMLDivElement>(null)
  const [error, setError] = useState<string | null>(null)
  const [theme] = useTheme()
  const systemPrefersDark = useSyncExternalStore(
    (onChange) => {
      const mq = window.matchMedia('(prefers-color-scheme: dark)')
      mq.addEventListener('change', onChange)
      return () => mq.removeEventListener('change', onChange)
    },
    () => window.matchMedia('(prefers-color-scheme: dark)').matches,
    // Server default matches the html element's default theme attribute (dark).
    () => true
  )
  const isDark =
    theme === THEME.dark || (theme === THEME.system && systemPrefersDark)

  useEffect(() => {
    const el = hostRef.current
    if (!el) return

    let cancelled = false
    el.replaceChildren()
    setError(null)

    const run = async () => {
      try {
        const mermaid = (await import('mermaid')).default
        mermaid.initialize({
          startOnLoad: false,
          theme: 'base',
          themeVariables: isDark ? darkThemeVariables : lightThemeVariables,
          securityLevel: 'loose',
          flowchart: { htmlLabels: true },
        })
        const { svg } = await mermaid.render(newMermaidRenderId(), source)
        if (!cancelled && hostRef.current === el) {
          const doc = new DOMParser().parseFromString(svg, 'image/svg+xml')
          const parsed = doc.querySelector('svg')
          if (parsed) {
            el.replaceChildren(document.importNode(parsed, true))
          } else {
            throw new Error('Mermaid returned invalid SVG')
          }
        }
      } catch (e) {
        if (!cancelled) {
          setError(
            e instanceof Error ? e.message : 'Failed to render Mermaid diagram'
          )
        }
      }
    }

    void run()
    return () => {
      cancelled = true
    }
  }, [source, isDark])

  if (error) {
    return (
      <pre
        className={clsx(
          'm-0 overflow-x-auto p-4 font-mono text-sm leading-relaxed text-red-700 dark:text-red-300',
          className
        )}
        role="alert"
      >
        {error}
      </pre>
    )
  }

  return (
    <div
      ref={hostRef}
      className={clsx(
        'flex min-h-[4rem] w-full justify-center overflow-x-auto px-4 py-6 md:px-6 md:py-8',
        '[&_svg]:mx-auto [&_svg]:max-h-none [&_svg]:max-w-full [&_svg]:h-auto',
        className
      )}
      role="img"
      aria-label="Diagram"
    />
  )
}
