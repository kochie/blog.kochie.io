import readingTime from 'reading-time'

export const ARTICLE_DIR = '99-fixture-sparse'

const publishedDate = new Date('2020-06-01T00:00:00.000Z')

/** Minimal front matter — optional fields omitted to assert defaults in `getArticleMatter`. */
export const sparseGrayMatterReadResult = {
  data: {
    title: 'Sparse',
    blurb: 'Blurb only',
    publishedDate,
    jumbotron: { src: 'j.png', alt: 'alt' },
  },
  content: 'Single line.',
  path: `./articles/${ARTICLE_DIR}/index.mdx`,
}

export const expectedSparseArticleMatter = {
  title: 'Sparse',
  blurb: 'Blurb only',
  author: '',
  path: sparseGrayMatterReadResult.path,
  jumbotron: {
    src: 'j.png',
    alt: 'alt',
    url: `/images/articles/${ARTICLE_DIR}/j.png`,
  },
  publishedDate: publishedDate.toJSON(),
  editedDate: publishedDate.toJSON(),
  keywords: [],
  tags: [],
  readTime: readingTime(sparseGrayMatterReadResult.content).text,
  indexPath: `/articles/${ARTICLE_DIR}/index.mdx`,
  articleDir: ARTICLE_DIR,
}
