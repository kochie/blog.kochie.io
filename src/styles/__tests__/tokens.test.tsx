/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach, afterEach, beforeAll } from 'vitest'

describe('Field Journal design tokens', () => {
  beforeAll(() => {
    const style = document.createElement('style')
    style.textContent = `
      :root {
        /* ─── Surfaces ─── */
        --color-bg:       #1A1815;
        --color-bg-deep:  #14110E;
        --color-bg-soft:  #232019;

        /* ─── Text ─── */
        --color-text:      #F4EFE6;
        --color-text-mute: #C9C0B0;
        --color-text-soft: #8C8576;

        /* ─── Accents ─── */
        --color-accent: #DA8665;
        --color-signal: #F2DC4A;

        /* ─── Hairlines and neutrals ─── */
        --color-rule:           rgba(244, 239, 230, 0.08);
        --color-steel-warm-700: #58504A;
        --color-steel-warm-500: #8C8576;
        --color-steel-warm-300: #C9C0B0;

        /* ─── Reading layout ─── */
        --width-prose: 40rem;
        --width-wide:  55rem;
        --width-bleed: 67.5rem;
        --width-site:  75rem;

        /* ─── Motion ─── */
        --motion-fast:  150ms;
        --motion-slow:  250ms;
        --motion-ease:  cubic-bezier(0.16, 1, 0.3, 1);
      }

      [data-theme="light"] {
        /* ─── Surfaces ─── */
        --color-bg:       #F4EDD9;
        --color-bg-deep:  #ECE2C6;
        --color-bg-soft:  #FAF6E8;

        /* ─── Text ─── */
        --color-text:      #1A1815;
        --color-text-mute: #4D4538;
        --color-text-soft: #847A6B;

        /* ─── Accents ─── */
        --color-accent: #C46A4A;
        --color-signal: #DBC23A;

        /* ─── Hairlines and neutrals ─── */
        --color-rule:           rgba(26, 24, 21, 0.12);
      }

      /* Reduced motion respect */
      @media (prefers-reduced-motion: reduce) {
        :root {
          --motion-fast: 0ms;
          --motion-slow: 0ms;
        }
      }
    `
    document.head.appendChild(style)
  })

  beforeEach(() => {
    document.documentElement.removeAttribute('data-theme')
  })

  afterEach(() => {
    document.documentElement.removeAttribute('data-theme')
  })

  it('defaults to dark mode tokens on :root', () => {
    const styles = getComputedStyle(document.documentElement)
    expect(styles.getPropertyValue('--color-bg').trim()).toBe('#1A1815')
    expect(styles.getPropertyValue('--color-text').trim()).toBe('#F4EFE6')
    expect(styles.getPropertyValue('--color-accent').trim()).toBe('#DA8665')
    expect(styles.getPropertyValue('--color-signal').trim()).toBe('#F2DC4A')
  })

  it('switches to light tokens when data-theme="light" is set', () => {
    document.documentElement.setAttribute('data-theme', 'light')
    const styles = getComputedStyle(document.documentElement)
    expect(styles.getPropertyValue('--color-bg').trim()).toBe('#F4EDD9')
    expect(styles.getPropertyValue('--color-text').trim()).toBe('#1A1815')
    expect(styles.getPropertyValue('--color-accent').trim()).toBe('#C46A4A')
  })

  it('exposes width tokens', () => {
    const styles = getComputedStyle(document.documentElement)
    expect(styles.getPropertyValue('--width-prose').trim()).toBe('40rem')
    expect(styles.getPropertyValue('--width-wide').trim()).toBe('55rem')
    expect(styles.getPropertyValue('--width-bleed').trim()).toBe('67.5rem')
  })
})
