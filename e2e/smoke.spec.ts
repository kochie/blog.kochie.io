import { expect, test } from '@playwright/test'

test.describe('smoke', () => {
  test('home loads', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveTitle(/Kochie/i)
  })

  test('tags index loads', async ({ page }) => {
    await page.goto('/tags')
    await expect(page).toHaveTitle(/Tags/i)
    await expect(page.getByRole('link', { name: 'Tags' })).toBeVisible()
  })

  test('authors index loads', async ({ page }) => {
    await page.goto('/authors')
    await expect(page).toHaveTitle(/Authors/i)
  })

  test('sample article loads', async ({ page }) => {
    const res = await page.goto('/articles/01-halo-physics')
    expect(res?.ok()).toBeTruthy()
    await expect(page).toHaveTitle(/Halo Physics/i)
  })
})
