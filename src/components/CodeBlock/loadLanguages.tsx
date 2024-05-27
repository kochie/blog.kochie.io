import { Prism } from 'prism-react-renderer'
import CodeBlock, { CodeBlockProps } from './codeblock'
import { PropsWithChildren, Suspense } from 'react'
;(typeof global !== 'undefined' ? global : window).Prism = Prism

export default async function LoadWrapper(
  props: PropsWithChildren<CodeBlockProps>
) {
  return (
    <Suspense fallback={<div>Loading languages</div>}>
      <CodeBlock {...props} />
    </Suspense>
  )
}
