// src/app/api/journal/ingest/whatsapp/route.ts
import crypto from 'crypto'
import * as Sentry from '@sentry/nextjs'
import { NextResponse } from 'next/server'
import { POST as corePost } from '@/app/api/journal/ingest/route'
import type { IngestImage, IngestPayload } from '@/lib/journal-ingest'
import { extractTags, todaySlug } from '@/lib/journal-ingest'

export const runtime = 'nodejs'

function validateTwilioSignature(
  authToken: string,
  url: string,
  params: Record<string, string>,
  signature: string
): boolean {
  const sortedKeys = Object.keys(params).sort()
  const paramString = sortedKeys.map((k) => `${k}${params[k]}`).join('')
  const data = url + paramString
  const expected = crypto
    .createHmac('sha1', authToken)
    .update(data, 'utf8')
    .digest('base64')

  // Length check required before timingSafeEqual — it throws if lengths differ.
  if (expected.length !== signature.length) return false
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature))
}

function escapeXml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function twimlReply(message: string): Response {
  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?><Response><Message>${escapeXml(message)}</Message></Response>`,
    { status: 200, headers: { 'Content-Type': 'text/xml' } }
  )
}

export async function POST(request: Request): Promise<Response> {
  const authToken = process.env.TWILIO_AUTH_TOKEN
  const webhookUrl = process.env.TWILIO_WEBHOOK_URL
  const accountSid = process.env.TWILIO_ACCOUNT_SID

  if (!authToken || !webhookUrl || !accountSid) {
    Sentry.captureException(
      new Error('WhatsApp webhook: missing Twilio env vars'),
      {
        extra: {
          hasAuthToken: !!authToken,
          hasWebhookUrl: !!webhookUrl,
          hasAccountSid: !!accountSid,
        },
      }
    )
    return NextResponse.json({ error: 'Not configured' }, { status: 500 })
  }

  const rawBody = await request.text()
  const params = Object.fromEntries(new URLSearchParams(rawBody).entries())
  const twilioSig = request.headers.get('x-twilio-signature') ?? ''

  let signatureValid = false
  try {
    signatureValid = validateTwilioSignature(
      authToken,
      webhookUrl,
      params,
      twilioSig
    )
  } catch {
    signatureValid = false
  }

  if (!signatureValid) {
    Sentry.captureException(
      new Error('WhatsApp webhook: invalid Twilio signature'),
      {
        extra: {
          configuredWebhookUrl: webhookUrl,
          requestUrl: request.url,
          paramKeys: Object.keys(params).sort(),
          signaturePresent: twilioSig.length > 0,
        },
      }
    )
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { body, tags } = extractTags(params.Body ?? '')
  const numMedia = parseInt(params.NumMedia ?? '0', 10)

  const images: IngestImage[] = []
  for (let i = 0; i < numMedia; i++) {
    const url = params[`MediaUrl${i}`]
    const contentType = params[`MediaContentType${i}`] ?? ''

    if (!url || !contentType.startsWith('image/')) continue

    try {
      const imgRes = await fetch(url, {
        headers: {
          Authorization: `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString('base64')}`,
        },
      })
      if (!imgRes.ok) {
        Sentry.captureException(
          new Error(`Failed to fetch Twilio media ${url}: ${imgRes.status}`)
        )
        continue
      }
      const arrayBuffer = await imgRes.arrayBuffer()
      const rawExt = contentType.split('/')[1] ?? 'jpg'
      const ext = rawExt === 'jpeg' ? 'jpg' : rawExt
      images.push({
        url,
        filename: `photo-${images.length + 1}.${ext}`,
        contentBase64: Buffer.from(arrayBuffer).toString('base64'),
      })
    } catch (err) {
      Sentry.captureException(err)
    }
  }

  const payload: IngestPayload = {
    body,
    tags,
    date: todaySlug(),
    images,
  }

  const secret = process.env.JOURNAL_INGEST_SECRET
  if (!secret) {
    Sentry.captureException(
      new Error('WhatsApp webhook: JOURNAL_INGEST_SECRET not set')
    )
    return twimlReply('Journal save failed: server misconfiguration.')
  }

  const coreRequest = new Request('http://localhost/api/journal/ingest', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${secret}`,
    },
    body: JSON.stringify(payload),
  })

  let typefullyUrl: string | undefined

  try {
    const coreRes = await corePost(coreRequest)
    // Always read the body before inspecting ok — avoids ReadableStream-locked errors.
    const coreBody = (await coreRes.json().catch(() => ({}))) as {
      typefullyUrl?: string
      error?: string
    }
    console.log('[whatsapp] core ingest response', {
      status: coreRes.status,
      body: coreBody,
    })

    if (!coreRes.ok) {
      Sentry.captureException(
        new Error(`WhatsApp webhook: core ingest returned ${coreRes.status}`),
        { extra: { status: coreRes.status, body: coreBody } }
      )
      return twimlReply(
        `Journal save failed (${coreRes.status}). Please try again.`
      )
    }

    typefullyUrl = coreBody.typefullyUrl
  } catch (err) {
    Sentry.captureException(err, {
      extra: { context: 'WhatsApp webhook: corePost threw unexpectedly' },
    })
    return twimlReply('Journal save failed unexpectedly. Please try again.')
  }

  let siteUrl: string
  try {
    siteUrl = new URL(webhookUrl).origin
  } catch (err) {
    Sentry.captureException(err, {
      extra: {
        context: 'WhatsApp webhook: invalid TWILIO_WEBHOOK_URL',
        webhookUrl,
      },
    })
    return twimlReply('Server misconfiguration.')
  }

  const journalUrl = `${siteUrl}/journal/${encodeURIComponent(payload.date)}`

  const messageParts = [journalUrl]
  if (typefullyUrl) messageParts.push(typefullyUrl)
  const messageText = messageParts.join('\n')

  console.log('[whatsapp] sending TwiML reply', { journalUrl, typefullyUrl })

  return twimlReply(messageText)
}
