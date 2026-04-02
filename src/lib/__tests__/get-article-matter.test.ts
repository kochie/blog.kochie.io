import readingTime from 'reading-time'
import { beforeEach, describe, expect, test, vi } from 'vitest'

vi.mock('gray-matter', () => ({
  default: {
    read: vi.fn(),
  },
}))

vi.mock('node:fs/promises', async (importOriginal) => {
  const actual = await importOriginal<typeof import('node:fs/promises')>()
  return {
    ...actual,
    readFile: vi.fn(() =>
      Promise.reject(new Error('getArticleMatter tests must not read disk'))
    ),
  }
})

import grayMatter from 'gray-matter'
import { getArticleMatter } from '@/lib/article-path'
import {
  ARTICLE_DIR as FULL_DIR,
  expectedFullArticleMatter,
  fullGrayMatterReadResult,
} from './fixtures/article-matter/full'
import {
  ARTICLE_DIR as SPARSE_DIR,
  expectedSparseArticleMatter,
  sparseGrayMatterReadResult,
} from './fixtures/article-matter/sparse'

const readMock = vi.mocked(grayMatter.read)

describe('getArticleMatter', () => {
  beforeEach(() => {
    readMock.mockReset()
  })

  test('maps gray-matter file data into ArticleMetadata (fixture: full)', () => {
    readMock.mockReturnValue(
      fullGrayMatterReadResult as ReturnType<typeof grayMatter.read>
    )
    expect(getArticleMatter(FULL_DIR)).toEqual(expectedFullArticleMatter)
    expect(readMock).toHaveBeenCalledWith(`./articles/${FULL_DIR}/index.mdx`)
  })

  test('fills defaults when optional fields are missing (fixture: sparse)', () => {
    readMock.mockReturnValue(
      sparseGrayMatterReadResult as ReturnType<typeof grayMatter.read>
    )
    expect(getArticleMatter(SPARSE_DIR)).toEqual(expectedSparseArticleMatter)
  })

  test('uses reading-time on gray-matter content', () => {
    const body = '\n\nExtra copy so read time changes.'
    readMock.mockReturnValue({
      ...sparseGrayMatterReadResult,
      content: sparseGrayMatterReadResult.content + body,
    } as ReturnType<typeof grayMatter.read>)

    const result = getArticleMatter(SPARSE_DIR)
    expect(result.readTime).toBe(
      readingTime(sparseGrayMatterReadResult.content + body).text
    )
  })
})
