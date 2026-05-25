import { NextResponse } from 'next/server'
import * as Sentry from '@sentry/nextjs'

const BEEHIIV_BASE_URL = 'https://api.beehiiv.com/v2'

export const runtime = 'edge'

interface SubscribeBody {
  email?: unknown
  name?: unknown
}

interface BeehiivCustomField {
  name: string
  value: string
}

interface BeehiivSubscribePayload {
  email: string
  send_welcome_email: boolean
  utm_source: string
  utm_medium: string
  reactivate_existing: boolean
  custom_fields?: BeehiivCustomField[]
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0
}

function buildPayload(
  email: string,
  name: string | null
): BeehiivSubscribePayload {
  const payload: BeehiivSubscribePayload = {
    email,
    send_welcome_email: true,
    reactivate_existing: false,
    utm_source: 'blog.kochie.io',
    utm_medium: 'subscribe-form',
  }
  if (name) {
    payload.custom_fields = [{ name: 'First Name', value: name }]
  }
  return payload
}

export async function POST(request: Request) {
  const apiKey = process.env.BEEHIIV_API_KEY
  const publicationId = process.env.BEEHIIV_PUBLICATION_ID

  if (!apiKey || !publicationId) {
    console.error('[beehiiv] missing BEEHIIV_API_KEY or BEEHIIV_PUBLICATION_ID')
    return NextResponse.json({ error: 'Not configured' }, { status: 500 })
  }

  let body: SubscribeBody | null
  try {
    body = (await request.json()) as SubscribeBody | null
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  if (!body || !isNonEmptyString(body.email)) {
    return NextResponse.json({ error: 'Email required' }, { status: 400 })
  }

  const email = body.email.trim()
  const name = isNonEmptyString(body.name) ? body.name.trim() : null

  try {
    const response = await fetch(
      `${BEEHIIV_BASE_URL}/publications/${publicationId}/subscriptions`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json; charset=utf-8',
        },
        body: JSON.stringify(buildPayload(email, name)),
      }
    )

    if (!response.ok) {
      console.error(
        '[beehiiv] subscribe failed:',
        response.status,
        response.statusText
      )
      return NextResponse.json({ error: 'Bad response' }, { status: 400 })
    }
  } catch (error) {
    Sentry.captureException(error)
    return NextResponse.json({ error: 'Upstream error' }, { status: 400 })
  }

  return NextResponse.json({ success: true }, { status: 200 })
}
