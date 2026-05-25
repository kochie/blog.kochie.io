import { test, expect } from '@playwright/test'

const articles = [
  '01-halo-physics',
  '02-contact-tracing',
  '03-holopin',
  '04-adding-revue-component',
  '05-up-review',
  '06-migrating-to-next13',
  '07-yeav-update',
  '08-s3-file-limit',
  '09-cleaning-up-old-paths',
  '10-hpc-with-step-functions',
  '11-redesigning-city-flags-with-ai',
  '12-iap-electron',
  '13-lambda-recursion',
]

test.describe('Article smoke tests', () => {
  // Run serially so the dev server isn't hammered with 13 parallel
  // compile-on-demand requests. Each article page also gets a longer
  // timeout because MDX compilation (KaTeX, syntax highlighting, etc.)
  // is slow on first hit.
  test.describe.configure({ mode: 'serial', timeout: 60_000 })


  for (const slug of articles) {
    test(`renders /articles/${slug} cleanly`, async ({ page }) => {
      // Filter known pre-existing browser-only noise:
      // - Sentry CSP/blob-worker (CSP doesn't include `blob:`)
      // - next-pwa's getInstalledRelatedApps API in non-top contexts
      const isKnownNoise = (text: string): boolean =>
        (text.includes('blob:') && text.includes('script-src')) ||
        text.includes('getInstalledRelatedApps')

      const consoleErrors: string[] = []
      page.on('console', (msg) => {
        if (msg.type() === 'error') {
          const text = msg.text()
          if (isKnownNoise(text)) return
          consoleErrors.push(text)
        }
      })

      page.on('pageerror', (err) => {
        if (isKnownNoise(err.message)) return
        consoleErrors.push(err.message)
      })

      const response = await page.goto(`/articles/${slug}`)
      expect(response?.status()).toBe(200)

      // Article opening must render the headline.
      await expect(page.locator('article header h1')).toBeVisible()

      // No hydration mismatch errors in the console.
      const hydrationErrors = consoleErrors.filter((e) =>
        e.toLowerCase().includes('hydration')
      )
      expect(hydrationErrors).toEqual([])

      // No other unexpected errors.
      expect(consoleErrors).toEqual([])
    })
  }
})
