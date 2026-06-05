import { compile, run } from '@mdx-js/mdx'
import * as runtime from 'react/jsx-runtime'
import remarkGfm from 'remark-gfm'
import remarkUnwrapImages from './remark-unwrap-images'
import rehypeLqip from './rehype-lqip-plugin'
import { rehypeRewriteImagePaths } from './journal-path'

const rehypeJournalLqip = rehypeLqip({
  fsDir: 'public/images/journal',
  publicDir: '/images/journal',
})

/**
 * Compile a raw journal markdown/MDX body into a renderable MDXContent component.
 * Applies the same remark/rehype plugins as the individual entry page.
 */
export async function compileJournalMdx(body: string) {
  // MDX's JSX parser rejects `<digit` sequences (e.g. `<4:00min/km`) because
  // tag names can't start with a digit. Escape them before compilation.
  const mdxSafeBody = body.replace(/<(\d)/g, '&lt;$1')

  const code = String(
    await compile(mdxSafeBody, {
      outputFormat: 'function-body',
      remarkPlugins: [remarkGfm, remarkUnwrapImages],
      rehypePlugins: [rehypeJournalLqip, rehypeRewriteImagePaths],
    })
  )

  const { default: MDXContent } = await run(code, {
    ...(runtime as any),
    baseUrl: import.meta.url,
  })

  return MDXContent
}
