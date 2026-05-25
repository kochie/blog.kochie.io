// src/lib/journal-hooks.ts
import * as Sentry from '@sentry/nextjs'
import type { IngestPayload } from './journal-ingest'

// ─── GitHub commit hook ────────────────────────────────────────────────────

function buildMarkdown(payload: IngestPayload): string {
  const tagsYaml =
    payload.tags.length > 0
      ? `tags:\n${payload.tags.map((t) => `  - ${t}`).join('\n')}`
      : 'tags: []'

  const imagesMd =
    payload.images.length > 0
      ? payload.images
          .map((img) => `![](./images/${payload.date}-${img.filename})`)
          .join('\n\n') + '\n\n'
      : ''

  return `---\ndate: ${payload.date}\n${tagsYaml}\n---\n\n${imagesMd}${payload.body}\n`
}

async function githubPut(
  path: string,
  content: string,
  message: string,
  token: string,
  owner: string,
  repo: string
): Promise<void> {
  const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`
  const headers: HeadersInit = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
  }

  // Fetch the existing file's SHA — required by the GitHub Contents API when
  // updating a file that already exists (create requires no sha, update does).
  let sha: string | undefined
  const getRes = await fetch(url, { method: 'GET', headers })
  if (getRes.ok) {
    const data = (await getRes.json()) as { sha: string }
    sha = data.sha
  } else if (getRes.status !== 404) {
    const text = await getRes.text()
    const error = new Error(`GitHub API error ${getRes.status}: ${text}`)
    Sentry.captureException(error)
    throw error
  }

  let res: Response
  try {
    res = await fetch(url, {
      method: 'PUT',
      headers,
      body: JSON.stringify({
        message,
        content,
        ...(sha !== undefined ? { sha } : {}),
      }),
    })
  } catch (err) {
    Sentry.captureException(err)
    throw err
  }

  if (!res.ok) {
    const text = await res.text()
    const error = new Error(`GitHub API error ${res.status}: ${text}`)
    Sentry.captureException(error)
    throw error
  }
}

export async function githubCommitHook(payload: IngestPayload): Promise<void> {
  const token = process.env.GITHUB_TOKEN
  const owner = process.env.GITHUB_OWNER
  const repo = process.env.GITHUB_REPO

  if (!token) throw new Error('GITHUB_TOKEN env var is required')
  if (!owner) throw new Error('GITHUB_OWNER env var is required')
  if (!repo) throw new Error('GITHUB_REPO env var is required')

  // 1. Commit each image first (download → base64 encode → PUT).
  //    Images must land in journal/images/ before the markdown commit so
  //    that the Vercel build triggered by the markdown commit already has
  //    the images available for prebuild to copy into public/images/journal/.
  for (const image of payload.images) {
    let imgContent: string

    if (image.contentBase64) {
      imgContent = image.contentBase64
    } else {
      let imgRes: Response
      try {
        imgRes = await fetch(image.url)
      } catch (err) {
        Sentry.captureException(err)
        continue
      }
      if (!imgRes.ok) {
        Sentry.captureException(
          new Error(`Failed to fetch image ${image.url}: ${imgRes.status}`)
        )
        continue
      }
      const arrayBuffer = await imgRes.arrayBuffer()
      imgContent = Buffer.from(arrayBuffer).toString('base64')
    }

    await githubPut(
      `journal/images/${payload.date}-${image.filename}`,
      imgContent,
      `journal: ${payload.date} (images)`,
      token,
      owner,
      repo
    )
  }

  // 2. Commit the markdown last — its Vercel build will have all images
  //    already present in the repo.
  const markdown = buildMarkdown(payload)
  const mdContent = Buffer.from(markdown, 'utf8').toString('base64')
  await githubPut(
    `journal/${payload.date}.md`,
    mdContent,
    `journal: ${payload.date}`,
    token,
    owner,
    repo
  )
}

// ─── Typefully draft hook ──────────────────────────────────────────────────

export async function typefullyDraftHook(
  _payload: IngestPayload,
  draftContent: string
): Promise<string | undefined> {
  const apiKey = process.env.TYPEFULLY_API_KEY
  if (!apiKey) throw new Error('TYPEFULLY_API_KEY env var is required')

  const headers: HeadersInit = {
    Authorization: `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
  }

  // Resolve social set ID — use env var if set, otherwise fetch the first one.
  let socialSetId = process.env.TYPEFULLY_SOCIAL_SET_ID
  if (!socialSetId) {
    let ssRes: Response
    try {
      ssRes = await fetch('https://api.typefully.com/v2/social-sets?limit=1', {
        headers,
      })
    } catch (err) {
      Sentry.captureException(err)
      throw err
    }
    if (!ssRes.ok) {
      const text = await ssRes.text()
      const error = new Error(`Typefully API error ${ssRes.status}: ${text}`)
      Sentry.captureException(error)
      throw error
    }
    const ssList = (await ssRes.json()) as Array<{ id: number | string }>
    if (!ssList.length) throw new Error('No Typefully social sets found')
    socialSetId = String(ssList[0].id)
  }

  let res: Response
  try {
    res = await fetch(
      `https://api.typefully.com/v2/social-sets/${socialSetId}/drafts`,
      {
        method: 'POST',
        headers,
        body: JSON.stringify({
          platforms: {
            x: { enabled: true, posts: [{ text: draftContent }] },
          },
        }),
      }
    )
  } catch (err) {
    Sentry.captureException(err)
    throw err
  }

  if (!res.ok) {
    const text = await res.text()
    const error = new Error(`Typefully API error ${res.status}: ${text}`)
    Sentry.captureException(error)
    throw error
  }

  const data = (await res.json()) as { id?: number | string }
  if (data.id != null)
    return `https://typefully.com/?a=${socialSetId}&d=${data.id}`
  return undefined
}
