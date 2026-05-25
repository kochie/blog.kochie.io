// src/app/api/journal/ingest/route.ts
import { timingSafeEqual } from 'crypto'
import * as Sentry from '@sentry/nextjs'
import { NextResponse } from 'next/server'
import { githubCommitHook, typefullyDraftHook } from '@/lib/journal-hooks'
import type { IngestPayload } from '@/lib/journal-ingest'

export const runtime = 'nodejs'

function isValidPayload(v: unknown): v is IngestPayload {
  if (!v || typeof v !== 'object') return false
  const p = v as Record<string, unknown>
  return (
    typeof p.body === 'string' &&
    typeof p.date === 'string' &&
    Array.isArray(p.tags) &&
    (p.tags as unknown[]).every((t) => typeof t === 'string') &&
    Array.isArray(p.images) &&
    (p.images as unknown[]).every(
      (img) =>
        img !== null &&
        typeof img === 'object' &&
        typeof (img as Record<string, unknown>).url === 'string' &&
        typeof (img as Record<string, unknown>).filename === 'string'
    )
  )
}

export async function POST(request: Request): Promise<Response> {
  const secret = process.env.JOURNAL_INGEST_SECRET
  const authHeader = request.headers.get('authorization') ?? ''
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : ''

  if (!secret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const tokenBuf = Buffer.from(token)
  const secretBuf = Buffer.from(secret)
  if (
    tokenBuf.length !== secretBuf.length ||
    !timingSafeEqual(tokenBuf, secretBuf)
  ) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let payload: IngestPayload
  try {
    const raw = await request.json()
    if (!isValidPayload(raw)) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
    }
    payload = raw
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  // Hook 1: GitHub commit (authoritative — failure = 500)
  try {
    await githubCommitHook(payload)
  } catch (err) {
    Sentry.captureException(err)
    return NextResponse.json({ error: 'GitHub commit failed' }, { status: 500 })
  }

  // Hook 2: Typefully draft (non-blocking — failure = logged only)
  // Pass the body directly; Typefully's own AI handles rephrasing for social.
  let typefullyUrl: string | undefined
  try {
    typefullyUrl = await typefullyDraftHook(payload, payload.body)
  } catch (err) {
    Sentry.captureException(err)
  }

  return NextResponse.json({ ok: true, typefullyUrl }, { status: 200 })
}
