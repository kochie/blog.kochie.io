import React, { ReactElement, PropsWithChildren } from 'react'
import Highlight, { defaultProps, Language } from 'prism-react-renderer'
import theme from 'prism-react-renderer/themes/nightOwl'

import styles from './codeblock.module.css'

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
    .replace(/language-/, '')
    .replace(RE, '') as Language
  const shouldHighlightLine = calculateLinesToHighlight(className)
  const code = children?.toString() || ''
  return (
    <Highlight {...defaultProps} code={code} language={language} theme={theme}>
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

            // padding: '1.3125rem',
            // fontFamily: 'Cascadia Code PL',
            // borderRadius: '0.5em',
            // tabSize: 2
          }}
        >
          {tokens.map((line, i) => {
            const lineProps = getLineProps({ line, key: i })
            if (shouldHighlightLine(i)) {
              lineProps.className = `${lineProps.className} ${styles['highlight-code-line']}`
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
  )
}

export { CodeBlock }
