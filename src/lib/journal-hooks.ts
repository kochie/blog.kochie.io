// src/lib/journal-hooks.ts
import * as Sentry from '@sentry/nextjs'
import type { IngestPayload } from './journal-ingest'

// ─── GitHub commit hook ────────────────────────────────────────────────────

function buildMarkdown(payload: IngestPayload): string {
  const tagsYaml =
    payload.tags.length > 0
      ? `tags:\n${payload.tags.map((t) => `  - ${t}`).join('\n')}`
      : 'tags: []'

  return `---\ndate: ${payload.date}\n${tagsYaml}\n---\n\n${payload.body}\n`
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
  let res: Response
  try {
    res = await fetch(url, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
      },
      body: JSON.stringify({ message, content }),
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

  // 1. Commit the markdown file.
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

  // 2. Commit each image (download → base64 encode → PUT).
  for (const image of payload.images) {
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
    const imgContent = Buffer.from(arrayBuffer).toString('base64')
    await githubPut(
      `public/images/journal/${payload.date}/${image.filename}`,
      imgContent,
      `journal: ${payload.date} (images)`,
      token,
      owner,
      repo
    )
  }
}

// ─── Typefully draft hook ──────────────────────────────────────────────────

export async function typefullyDraftHook(
  _payload: IngestPayload,
  draftContent: string
): Promise<void> {
  const apiKey = process.env.TYPEFULLY_API_KEY
  if (!apiKey) throw new Error('TYPEFULLY_API_KEY env var is required')

  let res: Response
  try {
    res = await fetch('https://api.typefully.com/v1/drafts/', {
      method: 'POST',
      headers: {
        'X-API-KEY': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        content: draftContent,
        threadify: false,
        'schedule-date': null,
      }),
    })
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
}
