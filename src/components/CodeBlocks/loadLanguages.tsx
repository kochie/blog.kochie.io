import { Prism } from 'prism-react-renderer'
import CodeBlock, { CodeBlockProps } from './codeblock'
import { PropsWithChildren, Suspense } from 'react'
import Loading from '@/components/Loading'
;(typeof global !== 'undefined' ? global : window).Prism = Prism

export default async function LoadWrapper(
  props: PropsWithChildren<CodeBlockProps>
) {
  return (
    <Suspense fallback={<Loading size={48} className="min-h-24" />}>
      <CodeBlock {...props} />
    </Suspense>
  )
}
