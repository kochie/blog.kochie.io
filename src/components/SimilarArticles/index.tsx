import Link from 'next/link'
import type { ArticleMetadata } from '@/lib/article-path'

const getArticleNumber = (articleDir: string): number | null => {
  const match = articleDir.match(/^(\d+)/)
  if (!match) return null
  return parseInt(match[1], 10)
}

const Card = ({ article }: { article: ArticleMetadata }) => {
  const num = getArticleNumber(article.articleDir)
  const tags = article.tags.slice(0, 2)
  return (
    <Link
      href={`/articles/${article.articleDir}`}
      className="group flex h-full flex-col p-5 border border-rule rounded-md bg-bg-soft hover:bg-bg-deep transition-colors duration-fast"
    >
      <div className="font-mono text-meta text-text-soft tracking-wide mb-3">
        {num !== null ? (
          <span className="text-accent">
            {'// '}
            {String(num).padStart(2, '0')}
          </span>
        ) : null}
        {num !== null && tags.length > 0 ? (
          <span className="mx-2 text-text-soft">·</span>
        ) : null}
        {tags.map((tag, i) => (
          <span key={tag}>
            {i > 0 ? <span className="mx-2 text-text-soft">·</span> : null}
            <span className="uppercase">{tag}</span>
          </span>
        ))}
      </div>
      <h3 className="font-serif font-semibold text-h3 text-text leading-tight mb-3 group-hover:text-accent transition-colors duration-fast">
        {article.title}
      </h3>
      <p className="font-serif italic text-text-mute leading-snug mb-4 line-clamp-3">
        {article.blurb}
      </p>
      <div className="font-mono text-meta text-text-soft tracking-wide mt-auto">
        {article.readTime.toUpperCase()}
      </div>
    </Link>
  )
}

interface SimilarArticlesProps {
  articles: ArticleMetadata[]
}

/**
 * "Similar essays" rail at the foot of an article. The article page picks
 * the candidate set via findSimilarArticles — explicit frontmatter list
 * first, falling back to tag overlap. Renders nothing when the candidate
 * set is empty so the article foot stays clean.
 */
const SimilarArticles = ({
  articles,
}: SimilarArticlesProps): React.ReactElement | null => {
  if (articles.length === 0) return null
  return (
    <section
      aria-labelledby="similar-essays-heading"
      className="mx-auto max-w-bleed px-4 my-16"
    >
      <h2
        id="similar-essays-heading"
        className="font-mono text-meta text-text-soft tracking-wide mb-6"
      >
        <span className="text-accent mr-2">{'// '}</span>
        SIMILAR ESSAYS
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {articles.map((article) => (
          <Card key={article.articleDir} article={article} />
        ))}
      </div>
    </section>
  )
}

export default SimilarArticles
