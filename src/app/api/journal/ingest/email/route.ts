// src/app/api/journal/ingest/email/route.ts
import { timingSafeEqual } from 'crypto'
import * as Sentry from '@sentry/nextjs'
import { NextResponse } from 'next/server'
import { POST as corePost } from '@/app/api/journal/ingest/route'
import type { IngestImage, IngestPayload } from '@/lib/journal-ingest'
import { extractTags, todaySlug } from '@/lib/journal-ingest'

export const runtime = 'nodejs'

interface PostmarkAttachment {
  Name: string
  Content: string // base64
  ContentType: string
}

interface PostmarkInboundPayload {
  TextBody?: string
  Attachments?: PostmarkAttachment[]
}

export async function POST(request: Request): Promise<Response> {
  const token = process.env.POSTMARK_INBOUND_TOKEN
  const inboundToken = request.headers.get('x-postmark-token') ?? ''

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const inboundBuf = Buffer.from(inboundToken)
  const tokenBuf = Buffer.from(token)
  if (
    inboundBuf.length !== tokenBuf.length ||
    !timingSafeEqual(inboundBuf, tokenBuf)
  ) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let raw: PostmarkInboundPayload
  try {
    raw = (await request.json()) as PostmarkInboundPayload
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { body, tags } = extractTags(raw.TextBody ?? '')

  const images: IngestImage[] = (raw.Attachments ?? [])
    .filter((a) => a.ContentType.startsWith('image/'))
    .map((a, i) => {
      const ext = a.Name.split('.').pop() ?? 'jpg'
      return {
        url: '',
        filename: `photo-${i + 1}.${ext}`,
        contentBase64: a.Content,
      }
    })

  const payload: IngestPayload = {
    body,
    tags,
    date: todaySlug(),
    images,
  }

  // Forward to core ingest handler with the shared secret.
  const secret = process.env.JOURNAL_INGEST_SECRET
  if (!secret) {
    Sentry.captureException(
      new Error('JOURNAL_INGEST_SECRET is not configured')
    )
    return NextResponse.json(
      { error: 'Server misconfiguration' },
      { status: 500 }
    )
  }
  const coreRequest = new Request('http://localhost/api/journal/ingest', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${secret}`,
    },
    body: JSON.stringify(payload),
  })

  return corePost(coreRequest)
}
