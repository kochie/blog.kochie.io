import readingTime from 'reading-time'

export const ARTICLE_DIR = '99-fixture-full'

const publishedDate = new Date('2021-05-28T02:30:00.000Z')
const editedDate = new Date('2025-07-31T01:27:00.000Z')

/** Return value for a mocked `gray-matter` `read()` — matches real shape for `getArticleMatter`. */
export const fullGrayMatterReadResult = {
  data: {
    title: 'Fixture Article',
    blurb: 'A short fixture blurb.',
    author: 'kochie',
    publishedDate,
    editedDate,
    jumbotron: { src: 'hero.jpg', alt: 'Hero alt' },
    tags: ['gaming', 'physics'],
    keywords: ['halo', 'ring'],
  },
  content: '# Hello Fixture\n\nSome paragraph text for reading time.',
  path: `./articles/${ARTICLE_DIR}/index.mdx`,
}

export const expectedFullArticleMatter = {
  title: 'Fixture Article',
  blurb: 'A short fixture blurb.',
  author: 'kochie',
  path: fullGrayMatterReadResult.path,
  jumbotron: {
    src: 'hero.jpg',
    alt: 'Hero alt',
    url: `/images/articles/${ARTICLE_DIR}/hero.jpg`,
  },
  publishedDate: publishedDate.toJSON(),
  editedDate: editedDate.toJSON(),
  keywords: ['halo', 'ring'],
  tags: ['gaming', 'physics'],
  readTime: readingTime(fullGrayMatterReadResult.content).text,
  indexPath: `/articles/${ARTICLE_DIR}/index.mdx`,
  articleDir: ARTICLE_DIR,
}
