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

  const reader = body.getReader()
  // let charsReceived = 0

  let result = new Uint8Array()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await reader.read().then(function processText({ done, value }): any {
    // Result objects contain two properties:
    // done  - true if the stream has already given you all its data.
    // value - some data. Always undefined when done is true.
    if (done) {
      console.log('Stream complete')
      return
    }

    // value for fetch streams is a Uint8Array
    // charsReceived += value.length;

    result = new Uint8Array([...result, ...value])

    // Read some more, and call this function again
    return reader.read().then(processText)
  })

  // console.log('result', result)
  const data = JSON.parse(new TextDecoder().decode(result))

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
