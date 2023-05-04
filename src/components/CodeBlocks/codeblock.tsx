'use client'
import React, {
  ReactElement,
  PropsWithChildren,
  useEffect,
  useState,
  use,
  startTransition,
} from 'react'
import { Highlight, themes, Prism } from 'prism-react-renderer'
import clsx from 'clsx'

const ExtraLanguages = Promise.all([
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  import('prismjs/components/prism-python'),
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  import('prismjs/components/prism-julia'),
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  import('prismjs/components/prism-graphql'),
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  import('prismjs/components/prism-c'),
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  import('prismjs/components/prism-css'),
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  import('prismjs/components/prism-go'),
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  import('prismjs/components/prism-css-extras'),
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
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

export interface CodeBlockProps {
  className?: string
}

const RE = /{([\d,-]*)}/
const LineOptionRE = /\[LineNumbers\]/
const WrapRE = /\[Wrap\]/
const ShrinkRE = /\[Shrink\]/
const FilenameRE = /\(.+\)/

const CopyButton = ({ code }: { code: string }) => (
  <div
    className="absolute top-3 right-3 group-hover:opacity-100 opacity-0 transform-gpu transition duration-200 group-hover:block"
    aria-label="Copy to clipboard"
    title="Copy to clipboard"
  >
    <FontAwesomeIcon
      icon={faCopy}
      size="xl"
      fixedWidth
      className="cursor-pointer p-2 bg-slate-500 hover:bg-slate-600 border-2 border-slate-500 hover:border-slate-800 duration-200 rounded-lg active:bg-slate-50"
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
}: PropsWithChildren<CodeBlockProps>) => {
  startTransition(() => {
    use(ExtraLanguages)
  })

  const language =
    className
      ?.replace(/language-/, '')
      ?.replace(RE, '')
      ?.replace(LineOptionRE, '')
      ?.replace(WrapRE, '')
      ?.replace(ShrinkRE, '')
      ?.replace(FilenameRE, '') ?? ''
  const shouldHighlightLine = calculateLinesToHighlight(className || '')
  const lineNumbersEnabled = LineOptionRE.test(className || '')
  const wrapEnabled = WrapRE.test(className || '')
  const shrinkEnabled = ShrinkRE.test(className || '')
  const filename = className?.match(FilenameRE)?.[0]?.slice(1, -1)

  const code = children?.toString().trimEnd() || ''
  const [theme] = useTheme()

  const [isDark, setIsDark] = useState(false)
  const [expanded, setExpanded] = useState(false)

  const codeTheme = isDark ? themes.nightOwl : themes.nightOwlLight
  const highlightClass = isDark
    ? styles['highlight-code-line-dark']
    : styles['highlight-code-line-light']

  useEffect(() => {
    switch (theme) {
      case THEME.dark: {
        setIsDark(true)
        break
      }
      case THEME.light: {
        setIsDark(false)
        break
      }
      case THEME.system: {
        if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
          setIsDark(true)
        }
        if (window.matchMedia('(prefers-color-scheme: light)').matches) {
          setIsDark(false)
        }
        break
      }
    }
  }, [theme])

  return (
    <div className="my-5 relative group">
      {shrinkEnabled ? (
        <div
          className="absolute bottom-3 right-3 group-hover:opacity-100 opacity-0 transform-gpu transition duration-200 group-hover:block"
          aria-label="Expand/Shrink"
          title={!expanded ? 'Expand' : 'Shrink'}
        >
          <FontAwesomeIcon
            icon={!expanded ? faArrowDownToLine : faArrowUpToLine}
            size="xl"
            fixedWidth
            className="cursor-pointer p-2 bg-slate-500 hover:bg-slate-600 border-2 border-slate-500 hover:border-slate-800 duration-200 rounded-lg active:bg-slate-50"
            onClick={() => setExpanded(!expanded)}
          />
        </div>
      ) : null}
      {filename ? (
        <div className="bg-gray-400 dark:bg-gray-800 rounded-t-lg py-2 px-5">
          <span className="italic text-xs font-mono">{filename}</span>
        </div>
      ) : null}
      <Highlight
        // {...defaultProps}
        code={code}
        language={language}
        theme={codeTheme}
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
              !(!shrinkEnabled || expanded) && 'h-72 overflow-y-auto',
              'relative',
              filename ? 'rounded-b-lg' : 'rounded-lg'
            )}
            style={style}
          >
            <CopyButton code={code} />
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
              if (wrapEnabled) {
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
                  {lineNumbersEnabled ? (
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
