/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx}',
    './public/articles/**/*.mdx',
    './articles/**/*.mdx',
    './src/components/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: ['selector', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        bg:        'var(--color-bg)',
        'bg-deep': 'var(--color-bg-deep)',
        'bg-soft': 'var(--color-bg-soft)',
        text:        'var(--color-text)',
        'text-mute': 'var(--color-text-mute)',
        'text-soft': 'var(--color-text-soft)',
        accent: 'var(--color-accent)',
        signal: 'var(--color-signal)',
        rule:   'var(--color-rule)',
        'steel-warm-700': 'var(--color-steel-warm-700)',
        'steel-warm-500': 'var(--color-steel-warm-500)',
        'steel-warm-300': 'var(--color-steel-warm-300)',
      },
      fontFamily: {
        serif: [
          'Source Serif 4',
          'Iowan Old Style',
          'Source Serif Pro',
          'Georgia',
          'serif',
        ],
        sans: [
          'Geist',
          'ui-sans-serif',
          'system-ui',
          'sans-serif',
        ],
        mono: [
          'Geist Mono',
          'ui-monospace',
          'SFMono-Regular',
          'monospace',
        ],
      },
      fontSize: {
        'display-hero': ['3.75rem', { lineHeight: '1.02', fontWeight: '600' }],
        'display-h1':   ['2.75rem', { lineHeight: '1.05', fontWeight: '600' }],
        h2:             ['1.75rem', { lineHeight: '1.15', fontWeight: '600' }],
        h3:             ['1.25rem', { lineHeight: '1.30', fontWeight: '600' }],
        deck:           ['1.1875rem', { lineHeight: '1.45', fontWeight: '400' }],
        body:           ['1.0625rem', { lineHeight: '1.70', fontWeight: '400' }],
        'body-sm':      ['0.9375rem', { lineHeight: '1.55', fontWeight: '400' }],
        meta:           ['0.75rem',   { lineHeight: '1.50', fontWeight: '500' }],
        ui:             ['0.875rem',  { lineHeight: '1.50', fontWeight: '500' }],
      },
      maxWidth: {
        prose: 'var(--width-prose)',
        wide:  'var(--width-wide)',
        bleed: 'var(--width-bleed)',
        site:  'var(--width-site)',
      },
      transitionDuration: {
        fast: 'var(--motion-fast)',
        slow: 'var(--motion-slow)',
      },
      transitionTimingFunction: {
        ease: 'var(--motion-ease)',
      },
      transitionDelay: {
        0: '0ms',
      },
      animation: {
        wiggle: 'wiggle 0.2s ease-in-out 5',
        'spin-slow': 'spin 3s linear infinite',
        'bounce-in': 'bounce-in 0.5s ease-in-out both',
        'bounce-out': 'bounce-out 0.5s ease-in-out both',
        'bounce-orig': 'bounceOrig 1s linear infinite',
        'load-in': 'load-in 0.5s linear',
      },
      keyframes: {
        bounceOrig: {
          '0%':   { transform: 'translateY(0)' },
          '25%':  { transform: 'translateY(5%)' },
          '50%':  { transform: 'translateY(0)' },
          '75%':  { transform: 'translateY(-5%)' },
          '100%': { transform: 'translateY(0)' },
        },
        wiggle: {
          '0%, 100%': { transform: 'rotate(-5deg)' },
          '50%':      { transform: 'rotate(5deg)' },
        },
        'load-in': {
          from: { visibility: 'hidden' },
          to:   { visibility: 'visible' },
        },
        'bounce-in': {
          from:  { opacity: 0 },
          '0%':  { opacity: 0, transform: 'scale3d(0.3, 0.3, 0.3)' },
          '20%': { transform: 'scale3d(1.1, 1.1, 1.1)' },
          '40%': { transform: 'scale3d(0.9, 0.9, 0.9)' },
          '60%': { opacity: 1, transform: 'scale3d(1.03, 1.03, 1.03)' },
          '80%': { transform: 'scale3d(0.97, 0.97, 0.97)' },
          to:    { opacity: 1, transform: 'scale3d(1, 1, 1)' },
        },
        'bounce-out': {
          from:  { opacity: 1 },
          '20%': { transform: 'scale3d(0.9, 0.9, 0.9)' },
          '55%': { opacity: 1, transform: 'scale3d(1.1, 1.1, 1.1)' },
          to:    { opacity: 0, transform: 'scale3d(0.3, 0.3, 0.3)' },
        },
      },
    },
  },
  plugins: [],
}
