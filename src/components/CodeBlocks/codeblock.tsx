'use client'
import React, {
  ReactElement,
  PropsWithChildren,
  useState,
  useEffect,
  useSyncExternalStore,
} from 'react'
import { Highlight, Prism } from 'prism-react-renderer'
import clsx from 'clsx'

const ExtraLanguages = Promise.all([
  // @ts-expect-error prism language paths are untyped
  import('prismjs/components/prism-python'),
  // @ts-expect-error prism language paths are untyped
  import('prismjs/components/prism-julia'),
  // @ts-expect-error prism language paths are untyped
  import('prismjs/components/prism-graphql'),
  // @ts-expect-error prism language paths are untyped
  import('prismjs/components/prism-c'),
  // @ts-expect-error prism language paths are untyped
  import('prismjs/components/prism-css'),
  // @ts-expect-error prism language paths are untyped
  import('prismjs/components/prism-go'),
  // @ts-expect-error prism language paths are untyped
  import('prismjs/components/prism-css-extras'),
  // @ts-expect-error prism language paths are untyped
  import('prismjs/components/prism-shell-session'),
])

;(typeof global !== 'undefined' ? global : window).Prism = Prism

import styles from './codeblock.module.css'
import { THEME, useTheme } from '@/components/Theme/context'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faArrowDownToLine,
  faArrowUpToLine,
  faCopy,
} from '@fortawesome/pro-duotone-svg-icons'

// Code blocks always render against a dark surface, regardless of page
// theme. This matches the convention (GitHub, Stack Overflow, NYT longreads)
// and ensures syntax-highlighting contrast is stable. Hex values mirror the
// dark-mode token values in tokens.css.
const fieldJournalTheme = {
  plain: {
    color: '#C9C0B0', // text-mute (dark)
    backgroundColor: '#14110E', // bg-deep (dark)
  },
  styles: [
    {
      types: ['comment', 'prolog', 'doctype', 'cdata'],
      style: { color: '#8C8576', fontStyle: 'italic' as const }, // text-soft (dark)
    },
    {
      types: ['keyword', 'tag', 'selector', 'attr-name', 'operator'],
      style: { color: '#DA8665' }, // accent (dark)
    },
    {
      types: ['string', 'char', 'inserted', 'attr-value'],
      style: { color: '#F2DC4A' }, // signal (dark)
    },
    {
      types: ['function', 'class-name', 'property'],
      style: { color: '#F4EFE6' }, // text (dark)
    },
    {
      types: ['number', 'boolean', 'constant', 'symbol'],
      style: { color: '#DA8665' }, // accent (dark)
    },
    {
      types: ['punctuation'],
      style: { color: '#8C8576' }, // text-soft (dark)
    },
  ],
}

export interface CodeBlockProps {
  className?: string
  lineNumbers?: boolean
  filename?: string
  wrap?: boolean
  shrink?: boolean
}

const RE = /{([\d,-]*)}/
const LineOptionRE = /\[LineNumbers\]/
const WrapRE = /\[Wrap\]/
const ShrinkRE = /\[Shrink\]/
const FilenameRE = /\(.+\)/

const CopyButton = ({ code }: { code: string }) => (
  <div
    className="absolute top-3 right-3 group-hover:opacity-100 opacity-0 transform-gpu transition duration-200 group-hover:block z-50"
    aria-label="Copy to clipboard"
    title="Copy to clipboard"
  >
    <FontAwesomeIcon
      icon={faCopy}
      size="xl"
      fixedWidth
      className="cursor-pointer p-2 bg-bg-deep hover:bg-bg-soft border-2 border-rule duration-200 rounded-lg active:opacity-70"
      onClick={() => {
        navigator.clipboard.writeText(code)
      }}
    />
  </div>
)

const calculateLinesToHighlight = (
  meta: string
): ((index: number) => boolean) => {
  if (!RE.test(meta)) {
    return (): boolean => false
  } else {
    const lineNumbers = RE.exec(meta)?.[1]
      .split(',')
      .map((v) => v.split('-').map((v) => parseInt(v, 10)))
    return (index: number): boolean => {
      const lineNumber = index + 1
      const inRange = lineNumbers?.some(([start, end]) =>
        end ? lineNumber >= start && lineNumber <= end : lineNumber === start
      )
      return !!inRange
    }
  }
}

const CodeBlock = ({
  children,
  className,
  filename,
  wrap,
  shrink,
  lineNumbers,
}: PropsWithChildren<CodeBlockProps>) => {
  const [extraLanguagesReady, setExtraLanguagesReady] = useState(false)

  useEffect(() => {
    let cancelled = false
    ExtraLanguages.catch((err) => {
      console.error('Failed to load extra languages', err)
    }).finally(() => {
      if (!cancelled) setExtraLanguagesReady(true)
    })
    return () => {
      cancelled = true
    }
  }, [])

  const language =
    className
      ?.replace(/language-/, '')
      ?.replace(RE, '')
      ?.replace(LineOptionRE, '')
      ?.replace(WrapRE, '')
      ?.replace(ShrinkRE, '')
      ?.replace(FilenameRE, '') ?? ''
  const shouldHighlightLine = calculateLinesToHighlight(className || '')

  const code = children?.toString().trimEnd() || ''
  const [theme] = useTheme()

  const systemPrefersDark = useSyncExternalStore(
    (onChange) => {
      const mq = window.matchMedia('(prefers-color-scheme: dark)')
      mq.addEventListener('change', onChange)
      return () => mq.removeEventListener('change', onChange)
    },
    () => window.matchMedia('(prefers-color-scheme: dark)').matches,
    () => false
  )

  const isDark =
    theme === THEME.dark || (theme === THEME.system && systemPrefersDark)

  const [expanded, setExpanded] = useState(false)

  const highlightClass = isDark
    ? styles['highlight-code-line-dark']
    : styles['highlight-code-line-light']

  if (!extraLanguagesReady) {
    return null
  }

  return (
    <div className="my-5 relative group">
      {shrink ? (
        <div
          className="absolute bottom-3 right-3 group-hover:opacity-100 opacity-0 transform-gpu transition duration-200 group-hover:block z-50"
          aria-label="Expand/Shrink"
          title={!expanded ? 'Expand' : 'Shrink'}
        >
          <FontAwesomeIcon
            icon={!expanded ? faArrowDownToLine : faArrowUpToLine}
            size="xl"
            fixedWidth
            className="cursor-pointer p-2 bg-bg-deep hover:bg-bg-soft border-2 border-rule duration-200 rounded-lg active:opacity-70"
            onClick={() => setExpanded(!expanded)}
          />
        </div>
      ) : null}
      <CopyButton code={code} />
      {filename ? (
        <div className="bg-[#14110E] border-b border-white/10 rounded-t-lg py-2 px-5">
          <span className="text-[#F2DC4A] font-mono text-meta">{filename}</span>
        </div>
      ) : null}
      <Highlight
        // {...defaultProps}
        code={code}
        language={language}
        theme={fieldJournalTheme as never}
      >
        {({
          className,
          style,
          tokens,
          getLineProps,
          getTokenProps,
        }): ReactElement => (
          <pre
            className={clsx(
              className,
              styles.code,
              !(!shrink || expanded) && 'h-72 overflow-y-auto',
              'relative',
              filename ? 'rounded-b-lg' : 'rounded-lg'
            )}
            style={style}
          >
            {tokens.map((line, i) => {
              const lineProps = getLineProps({ line })
              lineProps.className = clsx(
                lineProps.className,
                shouldHighlightLine(i) && highlightClass
              )
              // lineProps.className = `${lineProps.className}`
              // if (shouldHighlightLine(i)) {
              //   lineProps.className = `${lineProps.className} ${highlightClass}`
              // }
              if (wrap) {
                lineProps.style = {
                  ...lineProps.style,
                  whiteSpace: 'normal',
                  wordBreak: 'break-word',
                }
              }

              return (
                <div
                  key={i}
                  // className={lineProps.className}
                  // style={lineProps.style}
                  {...lineProps}
                >
                  {lineNumbers ? (
                    <span className="select-none opacity-50 pr-4 w-11 inline-block text-right">
                      {i + 1}
                    </span>
                  ) : null}
                  <span>
                    {line.map((token, key) => {
                      // const props =
                      return (
                        <span
                          key={key}
                          {...getTokenProps({ token })}
                          // className={props.className}
                          // style={props.style}
                        />
                      )
                    })}
                  </span>
                </div>
              )
            })}
          </pre>
        )}
      </Highlight>
    </div>
  )
}

export default CodeBlock
export { calculateLinesToHighlight }
