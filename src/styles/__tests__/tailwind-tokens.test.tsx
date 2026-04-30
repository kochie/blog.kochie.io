/**
 * @vitest-environment jsdom
 *
 * Smoke test: verify Tailwind utility classes wired through tokens
 * apply the expected CSS custom property references. We do NOT run
 * Tailwind compilation in tests — instead we verify the config object
 * shape so a future refactor doesn't silently break the token bridge.
 */
import { describe, it, expect } from 'vitest'
import config from '../../../tailwind.config.cjs'

describe('Tailwind token bridge', () => {
  const colors = config.theme.extend.colors as Record<string, string>

  it('exposes the core surface tokens', () => {
    expect(colors.bg).toBe('var(--color-bg)')
    expect(colors['bg-deep']).toBe('var(--color-bg-deep)')
    expect(colors['bg-soft']).toBe('var(--color-bg-soft)')
  })

  it('exposes the text tokens', () => {
    expect(colors.text).toBe('var(--color-text)')
    expect(colors['text-mute']).toBe('var(--color-text-mute)')
    expect(colors['text-soft']).toBe('var(--color-text-soft)')
  })

  it('exposes the accent and signal tokens', () => {
    expect(colors.accent).toBe('var(--color-accent)')
    expect(colors.signal).toBe('var(--color-signal)')
  })

  it('exposes the rule and steel-warm tokens', () => {
    expect(colors.rule).toBe('var(--color-rule)')
    expect(colors['steel-warm-700']).toBe('var(--color-steel-warm-700)')
  })

  it('does not declare darkMode in the JS config (handled by @custom-variant in main.css for Tailwind v4)', () => {
    expect(config.darkMode).toBeUndefined()
  })

  it('exposes the four width tiers as max-width tokens', () => {
    const maxWidth = config.theme.extend.maxWidth as Record<string, string>
    expect(maxWidth.prose).toBe('var(--width-prose)')
    expect(maxWidth.wide).toBe('var(--width-wide)')
    expect(maxWidth.bleed).toBe('var(--width-bleed)')
    expect(maxWidth.site).toBe('var(--width-site)')
  })

  it('exposes serif, sans, and mono font families', () => {
    const ff = config.theme.extend.fontFamily as Record<string, string[]>
    expect(ff.serif[0]).toBe('Source Serif 4')
    expect(ff.sans[0]).toBe('Geist')
    expect(ff.mono[0]).toBe('Geist Mono')
  })

  it('exposes motion-token transition durations and easing', () => {
    const td = config.theme.extend.transitionDuration as Record<string, string>
    const ttf = config.theme.extend.transitionTimingFunction as Record<string, string>
    expect(td.fast).toBe('var(--motion-fast)')
    expect(td.slow).toBe('var(--motion-slow)')
    expect(ttf.motion).toBe('var(--motion-ease)')
  })
})
