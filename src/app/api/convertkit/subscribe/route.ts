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
  const body = await request.json()

  // best to validate this with Zod...

  await subscribeToForm({
    formId: body.formId,
    email: body.email,
    name: body.name,
  })

  return new Response(JSON.stringify({ success: true }), { status: 200 })
}
