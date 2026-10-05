import { readFile } from 'fs/promises'
import { join } from 'path'
import { createProcessor } from '@mdx-js/mdx'
import { remark } from 'remark'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import remarkFrontmatter from 'remark-frontmatter'
import pkg from 'gray-matter'
import { getAllArticlesMetadata, type ArticleMetadata } from './article-path'
import { getEntries, type JournalEntry } from './journal-path'
import { buildProject, getAllProjectManifests } from './project-path'
const { read } = pkg

/**
 * Plain-markdown renditions of the site for language models, following the
 * llms.txt proposal (https://llmstxt.org): `/llms.txt` is an index of links,
 * `/llms-full.txt` inlines everything, and every article/journal entry is
 * available at its canonical URL with `.md` appended.
 */

export const SITE_URL = 'https://blog.kochie.io'
const SITE_TITLE = 'Kochie Engineering'
const SITE_SUMMARY =
  'The personal blog of Robert Koch, a software engineer from Melbourne, ' +
  'Australia, writing about engineering, maths, science, and technology.'

export const MARKDOWN_HEADERS = {
  'Content-Type': 'text/markdown; charset=utf-8',
  'X-Robots-Tag': 'noindex',
}

export const PLAIN_TEXT_HEADERS = {
  'Content-Type': 'text/plain; charset=utf-8',
}

export const articleUrl = (articleDir: string): string =>
  `${SITE_URL}/articles/${articleDir}`
export const journalUrl = (slug: string): string =>
  `${SITE_URL}/journal/${slug}`

const absoluteUrl = (url: string): string => {
  if (/^[a-z][a-z0-9+.-]*:/i.test(url) || url.startsWith('#')) return url
  return `${SITE_URL}${url.startsWith('/') ? '' : '/'}${url}`
}

// ---------------------------------------------------------------------------
// MDX → Markdown
// ---------------------------------------------------------------------------

// Loose mdast shapes; @types/mdast is only a transitive dependency.
type MdNode = {
  type: string
  value?: string
  url?: string
  alt?: string
  children?: MdNode[]
  [key: string]: unknown
}
type Root = MdNode & { children: MdNode[] }
type RootContent = MdNode
type PhrasingContent = MdNode

type JsxAttribute = { type: string; name?: string; value?: unknown }
type JsxNode = {
  type: 'mdxJsxFlowElement' | 'mdxJsxTextElement'
  name: string | null
  attributes: JsxAttribute[]
  children: RootContent[]
}

const mdxParser = createProcessor({
  remarkPlugins: [remarkFrontmatter, remarkGfm, remarkMath],
})

const markdownStringifier = remark()
  .use(remarkGfm)
  .use(remarkMath)
  .data('settings', { bullet: '-', emphasis: '_', rule: '-', fences: true })

const attr = (node: JsxNode, name: string): string | undefined => {
  const found = node.attributes.find(
    (a) => a.type === 'mdxJsxAttribute' && a.name === name
  )
  return typeof found?.value === 'string' ? found.value : undefined
}

const text = (value: string): PhrasingContent => ({ type: 'text', value })
const link = (url: string, label: string): PhrasingContent => ({
  type: 'link',
  url,
  children: [text(label)],
})

const toPlainText = (nodes: RootContent[]): string =>
  nodes
    .map((n) => {
      if ('value' in n && typeof n.value === 'string') return n.value
      if ('children' in n) return toPlainText(n.children as RootContent[])
      return ''
    })
    .join('')

/** Evaluates `{'literal'}` expressions; anything else is runtime-only. */
const stringLiteral = (expr: string): string | null => {
  const m = expr.trim().match(/^(['"`])([\s\S]*)\1$/)
  return m ? m[2] : null
}

interface Context {
  articleDir: string
  pageUrl: string
}

/**
 * Turns a JSX element into plain markdown nodes. Embeds and interactive
 * widgets can't be represented in text, so they become links back to the
 * source (or the article itself).
 */
function convertJsx(node: JsxNode, ctx: Context): RootContent[] {
  const name = node.name ?? ''
  const children = () => convertChildren(node.children, ctx)

  switch (name) {
    case 'YouTube': {
      const id = attr(node, 'id')
      const label = attr(node, 'source') ?? 'YouTube video'
      const caption = attr(node, 'caption')
      if (!id) return []
      return [
        link(`https://www.youtube.com/watch?v=${id}`, `Video: ${label}`),
        ...(caption ? [text(` — ${caption}`)] : []),
      ]
    }
    case 'GithubProject': {
      const owner = attr(node, 'owner')
      const repo = attr(node, 'repo')
      if (!owner || !repo) return []
      return [
        text('GitHub repository: '),
        link(`https://github.com/${owner}/${repo}`, `${owner}/${repo}`),
      ]
    }
    case 'Tweet': {
      const id = attr(node, 'id')
      return id
        ? [link(`https://twitter.com/i/status/${id}`, 'Embedded tweet')]
        : []
    }
    case 'LinkedInEmbed': {
      const url = attr(node, 'url')
      return url ? [link(url, 'Embedded LinkedIn post')] : []
    }
    case 'Video': {
      const src = attr(node, 'src')
      return src
        ? [
            link(
              absoluteUrl(
                join('/videos/articles', ctx.articleDir, src.split('?')[0])
              ),
              'Video'
            ),
          ]
        : []
    }
    case 'Quote': {
      const author = attr(node, 'author')
      const position = attr(node, 'position')
      const body = children()
      const attribution = [author, position].filter(Boolean).join(', ')
      return [
        {
          type: 'blockquote',
          children: [
            ...(wrapFlow(body) as any[]),
            ...(attribution
              ? [{ type: 'paragraph', children: [text(`— ${attribution}`)] }]
              : []),
          ],
        },
      ]
    }
    case 'img': {
      const src = attr(node, 'src')
      return src
        ? [{ type: 'image', url: absoluteUrl(src), alt: attr(node, 'alt') }]
        : []
    }
    case 'a': {
      const href = attr(node, 'href')
      const inner = children()
      return href
        ? [
            {
              type: 'link',
              url: absoluteUrl(href),
              children: inner as PhrasingContent[],
            },
          ]
        : inner
    }
    case 'code':
      return [{ type: 'inlineCode', value: toPlainText(children()) }]
    case 'link':
    case 'script':
    case 'style':
    case 'iframe':
      return []
    case '':
    case 'div':
    case 'span':
    case 'p':
    case 'center':
      return children()
    default:
      // Unknown component. If it wraps content keep the content, otherwise
      // it's an interactive widget that only exists on the rendered page.
      if (node.children.length > 0) return children()
      return [
        link(ctx.pageUrl, `Interactive element (${name}) — view on the blog`),
      ]
  }
}

const isPhrasing = (n: RootContent): boolean =>
  [
    'text',
    'emphasis',
    'strong',
    'delete',
    'inlineCode',
    'inlineMath',
    'link',
    'image',
    'break',
    'html',
  ].includes(n.type)

/** Groups runs of phrasing nodes into paragraphs so they're valid flow. */
function wrapFlow(nodes: RootContent[]): RootContent[] {
  const out: RootContent[] = []
  let run: PhrasingContent[] = []
  const flush = () => {
    if (run.some((n) => !(n.type === 'text' && !n.value?.trim()))) {
      out.push({ type: 'paragraph', children: run })
    }
    run = []
  }
  for (const n of nodes) {
    if (isPhrasing(n)) run.push(n as PhrasingContent)
    else {
      flush()
      out.push(n)
    }
  }
  flush()
  return out
}

function convertChildren(nodes: RootContent[], ctx: Context): RootContent[] {
  return nodes.flatMap((n) => convertNode(n, ctx))
}

function convertNode(node: RootContent, ctx: Context): RootContent[] {
  const n = node as RootContent & { type: string; value?: string }
  switch (n.type) {
    case 'yaml':
    case 'mdxjsEsm':
      return []
    case 'mdxFlowExpression':
    case 'mdxTextExpression': {
      const value = n.value ?? ''
      if (/^\s*\/\*[\s\S]*\*\/\s*$/.test(value)) return []
      const literal = stringLiteral(value)
      if (literal !== null) return [text(literal)]
      // Expression blocks wrapping JSX (e.g. `{ <div><Tweet/></div> }`).
      if (value.includes('<')) {
        try {
          const tree = mdxParser.parse(value.trim()) as Root
          return convertChildren(tree.children, ctx)
        } catch {
          return []
        }
      }
      return []
    }
    case 'mdxJsxFlowElement':
      return wrapFlow(convertJsx(n as unknown as JsxNode, ctx))
    case 'mdxJsxTextElement':
      return convertJsx(n as unknown as JsxNode, ctx)
    case 'image': {
      const url = n.url ?? ''
      return [
        {
          ...n,
          url: /^https?:/.test(url)
            ? url
            : absoluteUrl(
                join('/images/articles', ctx.articleDir, url.split('?')[0])
              ),
        } as RootContent,
      ]
    }
    case 'link':
    case 'definition':
      return [
        {
          ...n,
          url: absoluteUrl(n.url ?? ''),
          ...('children' in n
            ? { children: convertChildren(n.children as RootContent[], ctx) }
            : {}),
        } as RootContent,
      ]
  }
  if ('children' in n) {
    const converted = convertChildren(n.children as RootContent[], ctx)
    const flowParent = [
      'blockquote',
      'listItem',
      'footnoteDefinition',
    ].includes(n.type)
    return [
      {
        ...n,
        children: flowParent ? wrapFlow(converted) : converted,
      } as RootContent,
    ]
  }
  return [n]
}

/** Converts an article's MDX source (frontmatter included) to plain markdown. */
export function mdxToMarkdown(source: string, articleDir: string): string {
  const tree = mdxParser.parse(source) as Root
  const ctx: Context = { articleDir, pageUrl: articleUrl(articleDir) }
  const root: Root = {
    type: 'root',
    children: wrapFlow(convertChildren(tree.children, ctx)),
  }
  return markdownStringifier.stringify(root as never).trim()
}

/** Journal entries are plain markdown with a couple of custom inline tags. */
export function journalBodyToMarkdown(body: string, slug: string): string {
  return body
    .replace(
      /<Spotify\b[^>]*\blink="([^"]+)"[^>]*\/>/g,
      (_, url: string) => `[Listen on Spotify](${url})`
    )
    .replace(
      /<Place\b[^>]*\blink="([^"]+)"[^>]*>([\s\S]*?)<\/Place>/g,
      (_, url: string, label: string) =>
        `[${label.replace(/\s+/g, ' ').trim()}](${url})`
    )
    .replace(
      /<([A-Z]\w*)\b[^>]*\/>/g,
      (_, name: string) =>
        `[Interactive element (${name}) — view on the blog](${journalUrl(slug)})`
    )
    .replace(/\]\((\.?\/)?images\//g, `](${SITE_URL}/images/journal/`)
    .trim()
}

// ---------------------------------------------------------------------------
// Documents
// ---------------------------------------------------------------------------

// Dates in frontmatter carry a Melbourne offset; render them in that zone so
// they match the date shown on the site.
const isoDate = (d: string): string =>
  new Date(d).toLocaleDateString('en-CA', { timeZone: 'Australia/Melbourne' })

export async function articleToMarkdown(
  article: ArticleMetadata
): Promise<string> {
  const source = await readFile(article.path, 'utf-8')
  const { data } = read(article.path)
  const header = [
    `# ${oneLine(article.title)}`,
    '',
    `> ${String(article.blurb).trim().replace(/\s+/g, ' ')}`,
    '',
    `- URL: ${articleUrl(article.articleDir)}`,
    `- Author: Robert Koch`,
    `- Published: ${isoDate(article.publishedDate)}`,
    ...(article.editedDate && article.editedDate !== article.publishedDate
      ? [`- Updated: ${isoDate(article.editedDate)}`]
      : []),
    ...(article.tags.length ? [`- Tags: ${article.tags.join(', ')}`] : []),
    ...(article.project
      ? [`- Project: ${SITE_URL}/projects/${article.project}`]
      : []),
    ...(typeof data.podcast === 'string' ? [`- Podcast: ${data.podcast}`] : []),
  ].join('\n')

  return `${header}\n\n---\n\n${mdxToMarkdown(source, article.articleDir)}\n`
}

const journalTitle = (entry: JournalEntry): string => {
  const [y, m, d] = entry.slug.split('-').map(Number)
  if (!y || !m || !d) return `Journal — ${entry.slug}`
  return `Journal — ${new Date(y, m - 1, d).toLocaleDateString('en-AU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })}`
}

export function journalEntryToMarkdown(entry: JournalEntry): string {
  const header = [
    `# ${journalTitle(entry)}`,
    '',
    `- URL: ${journalUrl(entry.slug)}`,
    `- Date: ${entry.date}`,
    ...(entry.tags.length ? [`- Tags: ${entry.tags.join(', ')}`] : []),
  ].join('\n')
  return `${header}\n\n---\n\n${journalBodyToMarkdown(entry.body, entry.slug)}\n`
}

const oneLine = (s: string): string => String(s).trim().replace(/\s+/g, ' ')

/** The `/llms.txt` index. */
export async function buildLlmsTxt(): Promise<string> {
  const [articles, entries, manifests] = await Promise.all([
    getAllArticlesMetadata(),
    getEntries(),
    getAllProjectManifests(),
  ])
  const projects = await Promise.all(
    manifests.map((m) => buildProject(m.slug, articles))
  )

  const lines = [
    `# ${SITE_TITLE}`,
    '',
    `> ${SITE_SUMMARY}`,
    '',
    'Every article and journal entry is available as plain markdown by ' +
      'appending `.md` to its URL (for example ' +
      `${articleUrl(articles[0]?.articleDir ?? 'example')}.md). ` +
      `The full text of every article is concatenated at ${SITE_URL}/llms-full.txt.`,
    '',
    '## Articles',
    '',
    ...articles.map(
      (a) =>
        `- [${oneLine(a.title)}](${articleUrl(a.articleDir)}.md): ${oneLine(a.blurb)} ` +
        `(${isoDate(a.publishedDate)}; tags: ${a.tags.join(', ')})`
    ),
  ]

  if (projects.length) {
    lines.push('', '## Projects', '')
    for (const p of projects) {
      lines.push(
        `- [${oneLine(p.title)}](${SITE_URL}/projects/${p.slug}): ${oneLine(p.blurb)} ` +
          `Status: ${p.status}.` +
          (p.members.length
            ? ` Chapters: ${p.members
                .map((m) => `${articleUrl(m.article.articleDir)}.md`)
                .join(', ')}`
            : '')
      )
    }
  }

  lines.push(
    '',
    '## Pages',
    '',
    `- [About](${SITE_URL}/about): Who Robert is and what this blog covers.`,
    `- [Archive](${SITE_URL}/archive): Every article by date.`,
    `- [Tags](${SITE_URL}/tags): Articles grouped by topic.`,
    `- [Journal](${SITE_URL}/journal): Short daily notes.`,
    `- [RSS feed](${SITE_URL}/feed/rss.xml): Articles with full content.`
  )

  if (entries.length) {
    lines.push(
      '',
      '## Optional',
      '',
      ...entries.map(
        (e) =>
          `- [${journalTitle(e)}](${journalUrl(e.slug)}.md)` +
          (e.tags.length ? `: ${e.tags.join(', ')}` : '')
      )
    )
  }

  return lines.join('\n') + '\n'
}

/** The `/llms-full.txt` dump: every published article, newest first. */
export async function buildLlmsFullTxt(): Promise<string> {
  const articles = await getAllArticlesMetadata()
  const docs = await Promise.all(articles.map(articleToMarkdown))
  return [
    `# ${SITE_TITLE}`,
    '',
    `> ${SITE_SUMMARY}`,
    '',
    `This file contains the full text of every article on ${SITE_URL}, ` +
      'newest first. Each article is separated by a horizontal rule of ' +
      'equals signs.',
    '',
    docs.join('\n\n' + '='.repeat(80) + '\n\n'),
  ].join('\n')
}
