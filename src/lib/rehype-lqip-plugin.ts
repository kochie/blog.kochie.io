import { visit } from 'unist-util-visit'
import { isElement } from 'hast-util-is-element'
import { join } from 'path'
import sharp from 'sharp'
import { lqip } from './shrink'
import type { Node } from 'unist'
import type { Element } from 'hast'

/**
 * Walks the MDX hast tree, prefixes each `<img src>` with the article's
 * public asset path, and stamps two computed properties:
 *
 * - `lqip`: a low-quality blurred placeholder (data URI) for next/image's
 *   `placeholder="blur"` mode.
 * - Intrinsic `width`/`height` injected as URL params (`?width=…&height=…`)
 *   when the author hasn't already supplied them. Without this, next/image
 *   collapses to zero pixels and the image disappears. User-supplied
 *   `?width=` / `?height=` take precedence so authors can still resize.
 *
 * SVGs are read via sharp's libvips/rsvg support when possible; if sharp
 * can't determine dimensions for an unusual SVG, the try/catch lets the
 * file fall through with whatever the author wrote.
 */
function rehypeLqip(articleDir: string): () => (tree: Node) => Promise<void> {
  return () => transformer

  async function transformer(tree: Node): Promise<void> {
    const nodes: Element[] = []
    visit(tree, 'element', (node: Element) => {
      if (isElement(node, 'img')) {
        nodes.push(node)
      }
    })

    await Promise.all(
      nodes.map(async (node) => {
        if (!node?.properties?.src) return

        const rawSrc = node.properties.src.toString()
        const [filename, queryString] = rawSrc.split('?')
        const params = new URLSearchParams(queryString || '')
        const absolutePath = join(
          process.env.PWD || '',
          'public/images/articles',
          articleDir,
          filename
        )

        try {
          const meta = await sharp(absolutePath).metadata()
          if (meta.width && !params.has('width')) {
            params.set('width', String(meta.width))
          }
          if (meta.height && !params.has('height')) {
            params.set('height', String(meta.height))
          }
        } catch {
          // If sharp can't read the file (corrupt, unusual format, missing),
          // fall through silently — IMG will surface the issue at render
          // time rather than failing the whole build here.
        }

        const prefixed = join('/images/articles', articleDir, filename)
        const queryOut = params.toString()
        node.properties.src = queryOut ? `${prefixed}?${queryOut}` : prefixed
        node.properties.lqip = await lqip(absolutePath)
      })
    )
  }
}

export default rehypeLqip
