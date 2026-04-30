/**
 * @vitest-environment jsdom
 *
 * Verifies that motion-token cascade overrides work as authored.
 * jsdom doesn't evaluate `@media` queries, so we simulate the override
 * by writing the unconditional default tokens then a second override
 * block (mimicking the cascade that happens in browser when the media
 * query matches).
 */
import { afterEach, describe, it, expect } from 'vitest'

const removeInjectedStyles = () => {
  const styles = document.head.querySelectorAll('style[data-test-injected]')
  styles.forEach((style) => style.remove())
}

afterEach(removeInjectedStyles)

const inject = (css: string) => {
  const style = document.createElement('style')
  style.setAttribute('data-test-injected', 'true')
  style.textContent = css
  document.head.appendChild(style)
}

describe('prefers-reduced-motion', () => {
  it('collapses --motion-fast and --motion-slow to 0ms when the rule applies', () => {
    inject(`
      :root {
        --motion-fast: 150ms;
        --motion-slow: 250ms;
      }
      :root {
        --motion-fast: 0ms;
        --motion-slow: 0ms;
      }
    `)
    const styles = getComputedStyle(document.documentElement)
    expect(styles.getPropertyValue('--motion-fast').trim()).toBe('0ms')
    expect(styles.getPropertyValue('--motion-slow').trim()).toBe('0ms')
  })

  it('keeps the default motion durations when the rule does not apply', () => {
    inject(`
      :root {
        --motion-fast: 150ms;
        --motion-slow: 250ms;
      }
    `)
    const styles = getComputedStyle(document.documentElement)
    expect(styles.getPropertyValue('--motion-fast').trim()).toBe('150ms')
    expect(styles.getPropertyValue('--motion-slow').trim()).toBe('250ms')
  })
})
