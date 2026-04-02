import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getSharpMocks } from '@/test/sharp-mock'
import { lqip } from '../shrink'

const { sharpMock, toBuffer, resize } = getSharpMocks()

describe('lqip', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns empty string for .svg paths (no sharp call)', async () => {
    expect(await lqip('/assets/icon.svg')).toBe('')
    expect(sharpMock).not.toHaveBeenCalled()
  })

  it('resizes to 10px edge and returns a PNG data URL', async () => {
    const out = await lqip('/photos/hero.jpg')

    expect(out.startsWith('data:image/png;base64,')).toBe(true)
    expect(sharpMock).toHaveBeenCalledWith('/photos/hero.jpg')
    expect(resize).toHaveBeenCalledWith(10)
    expect(toBuffer).toHaveBeenCalled()
  })
})
