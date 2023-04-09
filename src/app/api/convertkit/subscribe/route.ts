import { NextResponse } from 'next/server'
import * as Sentry from '@sentry/nextjs'

const API_KEY = process.env.CONVERTKIT_API_KEY
const BASE_URL = 'https://api.convertkit.com/v3'

export const config = {
  runtime: 'edge',
}

function subscribeToForm(params: {
  formId: string
  email: string
  name: string
}) {
  const url = `${BASE_URL}/forms/${params.formId}/subscribe`

  const headers = new Headers({
    'Content-Type': 'application/json; charset=utf-8',
  })

  return fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      api_key: API_KEY,
      email: params.email,
      first_name: params.name,
    }),
  })
}

export async function POST(request: Request) {
  const data = await request.json()

  if (!data) {
    return NextResponse.json({ error: 'No body' }, { status: 400 })
  }

  // best to validate this with Zod...

  try {
    const response = await subscribeToForm(data)
    if (!response.ok) {
      console.error('response', response)
      console.log('response', response.status)
      return NextResponse.json({ error: 'Bad response' }, { status: 400 })
    }
  } catch (error) {
    Sentry.captureException(error)
    return NextResponse.json({ error }, { status: 400 })
  }

  return NextResponse.json({ success: true }, { status: 200 })
}
