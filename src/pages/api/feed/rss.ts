import { NextApiRequest, NextApiResponse } from 'next'
import { buildFeed } from '@/lib/feed'

const rss = async (_: NextApiRequest, res: NextApiResponse): Promise<void> => {
  const feed = await buildFeed()

  res.statusCode = 200
  res.setHeader('content-type', 'application/rss+xml')
  res.end(feed.rss2())
}

export default rss
