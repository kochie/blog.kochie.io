# Journal Ingest Setup

How to configure publishing journal entries from email (Postmark) and WhatsApp (Twilio) without touching a terminal.

---

## How it works

Every inbound message flows through the same pipeline:

1. A channel adapter (email or WhatsApp) validates the source, normalises the payload, and calls the core ingest handler.
2. The core handler commits `journal/YYYY-MM-DD.md` to the GitHub repo via the Contents API.
3. Vercel detects the push and redeploys automatically — the entry is live within ~30 seconds.
4. An AI-reframed draft is created in Typefully (unscheduled, requires manual action to post).

Tag syntax: trailing hashtags are extracted and become frontmatter tags. `Great ride today. #cycling #melbourne` → body: `"Great ride today."`, tags: `cycling`, `melbourne`. Mid-sentence hashtags are left in the body unchanged.

---

## Environment variables

Add all of these to your Vercel project (Settings → Environment Variables). Mark each one for Production; add to Preview/Development as needed.

| Variable | Where to find it |
|---|---|
| `JOURNAL_INGEST_SECRET` | Generate yourself — any long random string, e.g. `openssl rand -hex 32` |
| `GITHUB_TOKEN` | GitHub → Settings → Developer settings → Personal access tokens → Fine-grained token with **Contents: Read and write** on this repo |
| `GITHUB_OWNER` | Your GitHub username, e.g. `kochie` |
| `GITHUB_REPO` | Repository name, e.g. `blog.kochie.io` |
| `POSTMARK_INBOUND_TOKEN` | Postmark → your inbound stream → API Tokens |
| `TWILIO_AUTH_TOKEN` | Twilio Console → Account Info |
| `TWILIO_ACCOUNT_SID` | Twilio Console → Account Info |
| `TWILIO_WEBHOOK_URL` | The full public URL: `https://blog.kochie.io/api/journal/ingest/whatsapp` |
| `TYPEFULLY_API_KEY` | Typefully → Settings → API |

---

## Email via Postmark

### 1. Create a Postmark account

Sign up at [postmarkapp.com](https://postmarkapp.com) if you don't have one.

### 2. Create an inbound stream

1. In the Postmark dashboard, go to **Servers** → your server (or create one).
2. Select the **Message Streams** tab.
3. Click **Create Stream** → choose **Inbound**.
4. Give it a name like `journal-inbound`.

### 3. Configure the inbound address

Postmark assigns a unique inbound address like `abc123@inbound.postmarkapp.com`. You can either:

- **Use it directly** — send emails to `abc123@inbound.postmarkapp.com`.
- **Set up a custom address** — add an MX record for a subdomain (e.g. `journal.kochie.io`) pointing to `inbound.postmarkapp.com`, then configure it in Postmark. This lets you use `journal@kochie.io`.

### 4. Set the webhook URL

In your inbound stream settings, set the **Webhook URL** to:

```
https://blog.kochie.io/api/journal/ingest/email
```

### 5. Copy the token

Go to your inbound stream → **API Tokens**. Copy the token and set it as `POSTMARK_INBOUND_TOKEN` in Vercel.

### 6. Test it

Send a plain-text email to your inbound address. The subject line is ignored. Body and image attachments (JPEG, PNG, etc.) are processed; PDFs and other non-image attachments are ignored.

```
Rust's borrow checker finally clicked today. Ownership is a constraint
that becomes a superpower once the model is truly internal.

#rust #programming
```

Check the Vercel deployment log — a new commit should appear in the repo within a minute.

---

## WhatsApp via Twilio

### 1. Create a Twilio account

Sign up at [twilio.com](https://www.twilio.com) if you don't have one.

### 2. Get a WhatsApp-enabled number

**Option A — Sandbox (free, for testing):**

1. In the Twilio Console, go to **Messaging** → **Try it out** → **Send a WhatsApp message**.
2. Follow the instructions to join the sandbox by sending a join code from your phone.
3. The sandbox number is shared; it's fine for personal use.

**Option B — Production number:**

1. Go to **Phone Numbers** → **Buy a number**.
2. Filter for numbers with WhatsApp capability.
3. Submit the WhatsApp Business profile application (takes 1–3 days to approve).

### 3. Set the webhook URL

**Sandbox:**
1. Go to **Messaging** → **Try it out** → **Send a WhatsApp message** → **Sandbox Settings**.
2. Set **When a message comes in** to:
   ```
   https://blog.kochie.io/api/journal/ingest/whatsapp
   ```
   Method: **HTTP POST**.

**Production number:**
1. Go to **Phone Numbers** → **Manage** → your number.
2. Under **Messaging Configuration**, set **A message comes in** → Webhook → the URL above.

### 4. Copy your credentials

In the Twilio Console, find your **Account SID** and **Auth Token** on the main dashboard. Set them as `TWILIO_ACCOUNT_SID` and `TWILIO_AUTH_TOKEN` in Vercel.

Set `TWILIO_WEBHOOK_URL` to `https://blog.kochie.io/api/journal/ingest/whatsapp` — this exact URL is used for signature validation and must match what Twilio sends requests to.

### 5. Enable media (images)

Twilio sends image URLs in the webhook payload. The handler downloads them immediately using your Auth Token (Twilio media URLs expire quickly). No extra configuration is needed — just ensure `TWILIO_ACCOUNT_SID` and `TWILIO_AUTH_TOKEN` are set.

### 6. Test it

Send a WhatsApp message to your Twilio number from the phone you registered with the sandbox (or any number for a production setup):

```
Melbourne's new cycling lane network launched today. The Swanston St
extension is long overdue — genuinely good urban planning for once.

#melbourne #cycling
```

You can also send photos — they'll be committed to `public/images/journal/YYYY-MM-DD/` alongside the entry.

---

## Typefully drafts

Every inbound entry automatically creates an **unscheduled** draft in Typefully. The content is an AI-reframed version of the entry body — shorter, different angle, no hashtags. Nothing posts without you manually scheduling it in the Typefully UI.

To set this up:

1. Create a [Typefully](https://typefully.com) account and connect your Twitter/X account.
2. Go to **Settings** → **API** and create an API key.
3. Set it as `TYPEFULLY_API_KEY` in Vercel.

If `TYPEFULLY_API_KEY` is not set, the hook is skipped and the entry is still committed normally.

---

## Troubleshooting

**Entry not appearing after sending:**
- Check Vercel's deployment log for a new commit triggered by the GitHub API.
- Check Vercel's Function logs for `/api/journal/ingest/*` — errors are captured to Sentry.
- Verify all required env vars are set in Vercel (a missing `GITHUB_TOKEN` or `JOURNAL_INGEST_SECRET` will cause silent failures from Postmark/Twilio's perspective).

**WhatsApp images not attaching:**
- Confirm `TWILIO_ACCOUNT_SID` is set alongside `TWILIO_AUTH_TOKEN` — both are required for authenticated media downloads.

**Getting a 401 from the webhook:**
- For Postmark: confirm the `X-Postmark-Token` header matches `POSTMARK_INBOUND_TOKEN`.
- For Twilio: confirm `TWILIO_WEBHOOK_URL` exactly matches the URL Twilio is calling (including `https://`, no trailing slash).

**Date is wrong:**
- Dates default to today UTC. If you're writing late at night and the entry appears under the next day, this is expected — the pipeline uses the UTC clock at the moment the message is received.
