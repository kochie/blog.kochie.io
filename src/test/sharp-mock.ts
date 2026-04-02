import { vi } from 'vitest'

/**
 * Global `sharp` stub for Vitest. Native `sharp` (libvips) + jsdom’s optional
 * `canvas` (Cairo/GIO) both register the same Obj-C class on macOS; mocking
 * `sharp` here avoids loading both in one process.
 */
const sharpMocks = vi.hoisted(() => {
  const toBuffer = vi.fn(async () => Buffer.from('px', 'utf8'))
  const resize = vi.fn(() => ({ toBuffer }))
  const sharpMock = vi.fn(() => ({ resize }))
  return { sharpMock, toBuffer, resize }
})

vi.mock('sharp', () => ({
  default: sharpMocks.sharpMock,
}))

export function getSharpMocks() {
  return sharpMocks
}
