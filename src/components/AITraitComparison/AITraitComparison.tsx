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

  return (
    <div className="not-prose my-8">
      <div className="mb-4">
        <Combobox
          value={selectedAIs}
          onChange={(values: AIKey[]) => {
            // Keep at least one AI selected so the chart always renders.
            if (values.length > 0) setSelectedAIs(values)
          }}
          multiple
        >
          <div className="space-y-2 lg:mx-48">
            <label
              className="text-sm font-semibold text-zinc-700 dark:text-zinc-300"
              htmlFor="ai-trait-comparison"
            >
              Select one or more AIs to compare
            </label>
            <div className="relative">
              <ComboboxInput
                id="ai-trait-comparison"
                aria-label="Search and select AIs to compare"
                displayValue={() => ''}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search AIs..."
                className="w-full rounded-md border border-zinc-300 bg-white py-2 pl-3 pr-10 text-sm text-zinc-900 shadow-sm outline-none focus:border-zinc-500 focus:ring-2 focus:ring-zinc-300 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:focus:border-zinc-500 dark:focus:ring-zinc-700"
              />
              <ComboboxButton className="absolute inset-y-0 right-0 flex items-center px-3 text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200">
                <span aria-hidden>▾</span>
              </ComboboxButton>
              <ComboboxOptions className="absolute z-20 mt-2 max-h-64 w-full overflow-auto rounded-md border border-zinc-200 bg-white p-1 shadow-lg empty:invisible dark:border-zinc-700 dark:bg-zinc-900">
                {filteredOptions.map((option) => (
                  <ComboboxOption
                    key={option}
                    value={option}
                    className={({ focus }) =>
                      [
                        'flex cursor-pointer items-center justify-between rounded px-3 py-2 text-sm',
                        focus
                          ? 'bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100'
                          : 'text-zinc-700 dark:text-zinc-200',
                      ].join(' ')
                    }
                  >
                    {({ selected }) => (
                      <>
                        <span>{option}</span>
                        <span
                          className={
                            selected
                              ? 'text-zinc-900 dark:text-zinc-100'
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
              </ComboboxOptions>
            </div>
            <div className="flex flex-wrap gap-2">
              {selectedAIs.map((name) => (
                <span
                  key={name}
                  className="inline-flex items-center rounded-full border border-zinc-300 bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
                >
                  {name}
                </span>
              ))}
            </div>
          </div>
        </Combobox>
      </div>

      <MermaidDiagram
        source={mermaidSource}
        caption="Compare fictional AIs across AGI-like traits."
      />
    </div>
  )
}
