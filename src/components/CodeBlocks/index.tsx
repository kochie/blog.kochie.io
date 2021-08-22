import React, { PropsWithChildren, ReactElement } from 'react'
import Highlight, { Language, defaultProps } from 'prism-react-renderer'
import themeDark from 'prism-react-renderer/themes/nightOwl'
import themeLight from 'prism-react-renderer/themes/nightOwlLight'

import styles from './codeblock.module.css'
import { THEME, useTheme } from '@/components/Theme/context'

interface CodeBlockProps {
  className: string
}

const RE = /{([\d,-]+)}/

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
}: PropsWithChildren<CodeBlockProps>): ReactElement => {
  const language = className
    ?.replace(/language-/, '')
    ?.replace(RE, '') as Language
  const shouldHighlightLine = calculateLinesToHighlight(className)
  const code = children?.toString().trimEnd() || ''
  const { theme } = useTheme()
  // console.log(theme)
  // const theme = themeDark
  return (
    <div className="my-5">
      <Highlight
        {...defaultProps}
        code={code}
        language={language}
        theme={theme === THEME.dark ? themeDark : themeLight}
      >
        {({
          className,
          style,
          tokens,
          getLineProps,
          getTokenProps,
        }): ReactElement => (
          <pre
            className={`${className} ${styles.code}`}
            style={{
              ...style,
            }}
          >
            {tokens.map((line, i) => {
              const lineProps = getLineProps({ line, key: i })
              if (shouldHighlightLine(i)) {
                const highlightClass =
                  theme === THEME.dark
                    ? styles['highlight-code-line-dark']
                    : styles['highlight-code-line-light']
                lineProps.className = `${lineProps.className} ${highlightClass}`
              }

              return (
                <div key={i} {...lineProps}>
                  {line.map((token, key) => (
                    <span key={key} {...getTokenProps({ token, key })} />
                  ))}
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
