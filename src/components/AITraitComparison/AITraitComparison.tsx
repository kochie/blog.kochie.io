'use client'

import {
  Combobox,
  ComboboxButton,
  ComboboxInput,
  ComboboxOption,
  ComboboxOptions,
} from '@headlessui/react'
import { useMemo, useState } from 'react'
import MermaidDiagram from '@/components/MermaidDiagram'
import Figure from '@/components/Figure'

type AIKey =
  | 'Cortana'
  | 'HAL'
  | 'Sonny'
  | 'FRAN'
  | 'NS-4'
  | 'NS-5'
  | 'Data'
  | 'Demerzel'
  | 'Mendicant Bias'
  | '343 Guilty Spark'
  | 'LLMs'
  | 'Humans'

const AXES = [
  'Reasoning',
  'Agency',
  'Learning',
  'Planning',
  'Communication',
  'Integration',
  'Knowledge',
] as const

const TRAITS: Record<
  AIKey,
  [number, number, number, number, number, number, number]
> = {
  Cortana: [4, 5, 4, 5, 4, 3, 4],
  HAL: [3, 3, 1, 2, 2, 3, 3],
  Sonny: [4, 5, 3, 3, 4, 4, 3],
  FRAN: [2, 2, 1, 1, 4, 3, 2],
  'NS-4': [1, 3, 2, 2, 3, 2, 3],
  'NS-5': [2, 4, 3, 3, 4, 3, 4],
  Data: [4, 4, 4, 3, 4, 3, 3],
  Demerzel: [3, 3, 3, 4, 5, 4, 4],
  'Mendicant Bias': [5, 5, 4, 5, 4, 4, 5],
  '343 Guilty Spark': [3, 2, 3, 3, 3, 2, 2],
  LLMs: [1, 3, 2, 3, 4, 4, 4],
  Humans: [4, 4, 4, 4, 4, 4, 4],
}

const AI_OPTIONS = Object.keys(TRAITS) as AIKey[]

const buildMermaidRadar = (selected: AIKey[]) => {
  const curveLines = selected
    .map((name, index) => {
      const curveId = String.fromCharCode(97 + index)
      const values = TRAITS[name].join(', ')
      return `  curve ${curveId}["${name}"]{${values}}`
    })
    .join('\n')

  return `radar-beta
  title AI Trait Breakdown
  axis a["${AXES[0]}"], b["${AXES[1]}"], c["${AXES[2]}"], d["${AXES[3]}"]
  axis e["${AXES[4]}"], f["${AXES[5]}"], h["${AXES[6]}"]

${curveLines}

  graticule polygon
  max 5`
}

export default function AITraitComparison() {
  const [selectedAIs, setSelectedAIs] = useState<AIKey[]>(['LLMs'])
  const [query, setQuery] = useState('')

  const mermaidSource = useMemo(
    () => buildMermaidRadar(selectedAIs),
    [selectedAIs]
  )

  const filteredOptions = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    if (!normalizedQuery) return AI_OPTIONS
    return AI_OPTIONS.filter((name) =>
      name.toLowerCase().includes(normalizedQuery)
    )
  }, [query])

  const removeAI = (name: AIKey) => {
    setSelectedAIs((current) =>
      current.length > 1 ? current.filter((n) => n !== name) : current
    )
  }

  return (
    <div className="not-prose my-10">
      {/* Control panel — same frame language as a figure: rule border on
          the soft surface, mono kicker, clay slash. Sits above the radar
          so the reader reads "what to compare" before "the comparison". */}
      <div className="mx-auto mb-4 max-w-wide rounded-md border border-rule bg-bg-soft p-5 md:p-6">
        <div className="mb-4 flex items-baseline justify-between font-mono text-meta tracking-wide text-text-soft">
          <span>
            <span className="text-accent">{'// COMPARE'}</span>
            <span className="ml-2">FICTIONAL AIs</span>
          </span>
          <span aria-live="polite">
            {selectedAIs.length} / {AI_OPTIONS.length} selected
          </span>
        </div>

        <Combobox
          value={selectedAIs}
          onChange={(values: AIKey[]) => {
            // Keep at least one AI selected so the chart always renders.
            if (values.length > 0) setSelectedAIs(values)
          }}
          multiple
        >
          <label
            className="block font-mono text-meta uppercase tracking-wide text-text-soft"
            htmlFor="ai-trait-comparison"
          >
            Search and select
          </label>
          <div className="relative mt-2">
            <ComboboxInput
              id="ai-trait-comparison"
              aria-label="Search and select AIs to compare"
              displayValue={() => ''}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Type to filter — Cortana, HAL, Data..."
              className="block w-full rounded-md border border-rule bg-bg-deep px-3 py-2.5 pr-10 font-sans text-ui text-text placeholder:text-text-soft transition-colors duration-fast ease-motion focus:border-accent focus:outline-none"
            />
            <ComboboxButton
              aria-label="Toggle options"
              className="absolute inset-y-0 right-0 flex items-center px-3 font-mono text-text-soft transition-colors duration-fast ease-motion hover:text-accent"
            >
              <span aria-hidden>▾</span>
            </ComboboxButton>
            <ComboboxOptions className="absolute z-20 mt-2 max-h-64 w-full overflow-auto rounded-md border border-rule bg-bg-deep p-1 shadow-lg empty:invisible">
              {filteredOptions.map((option) => (
                <ComboboxOption
                  key={option}
                  value={option}
                  className={({ focus }) =>
                    [
                      'flex cursor-pointer items-center justify-between rounded px-3 py-2 font-sans text-ui transition-colors duration-fast ease-motion',
                      focus ? 'bg-bg-soft text-text' : 'text-text-mute',
                    ].join(' ')
                  }
                >
                  {({ selected }) => (
                    <>
                      <span>{option}</span>
                      <span
                        className={
                          selected
                            ? 'font-mono text-accent'
                            : 'text-transparent'
                        }
                        aria-hidden
                      >
                        ✓
                      </span>
                    </>
                  )}
                </ComboboxOption>
              ))}
              {filteredOptions.length === 0 ? (
                <div className="px-3 py-2 font-serif italic text-body-sm text-text-soft">
                  No matches.
                </div>
              ) : null}
            </ComboboxOptions>
          </div>
        </Combobox>

        {/* Selected chips — clay border, mono uppercase. Click removes;
            the last remaining chip locks so the chart never renders empty. */}
        <div className="mt-5">
          <div className="mb-2 font-mono text-meta uppercase tracking-wide text-text-soft">
            Selected
          </div>
          <ul className="flex list-none flex-wrap gap-2 p-0">
            {selectedAIs.map((name) => {
              const canRemove = selectedAIs.length > 1
              return (
                <li key={name}>
                  <button
                    type="button"
                    onClick={() => removeAI(name)}
                    aria-label={
                      canRemove
                        ? `Remove ${name} from comparison`
                        : `${name} — at least one selection is required`
                    }
                    className={[
                      'inline-flex items-center gap-1.5 rounded-full',
                      'border border-accent px-2.5 py-1',
                      'font-mono text-meta uppercase tracking-wide text-text',
                      'transition-colors duration-fast ease-motion',
                      canRemove
                        ? 'cursor-pointer hover:bg-accent hover:text-bg'
                        : 'cursor-default opacity-80',
                    ].join(' ')}
                  >
                    <span>{name}</span>
                    {canRemove ? (
                      <span aria-hidden className="leading-none">
                        ×
                      </span>
                    ) : null}
                  </button>
                </li>
              )
            })}
          </ul>
        </div>
      </div>

      {/* Radar — wrapped in the project Figure frame so it earns a
          FIG. nn caption alongside every other figure in the article. */}
      <Figure
        kind="diagram"
        tier="wide"
        caption="Fictional AIs compared across AGI-like traits."
      >
        <MermaidDiagram source={mermaidSource} />
      </Figure>
    </div>
  )
}
