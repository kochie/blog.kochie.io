import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'node:path'
import { fileURLToPath, URL } from 'node:url'
import { readFileSync } from 'node:fs'

const root = fileURLToPath(new URL('.', import.meta.url))
const emptyPrismLang = path.join(root, 'src/test/empty-prism-lang.ts')

function stubPrismLanguageImports(): import('vite').Plugin {
  return {
    name: 'stub-prism-language-imports',
    enforce: 'pre',
    resolveId(id) {
      if (id.includes('prismjs/components/prism-')) return emptyPrismLang
      return null
    },
  }
}

export default defineConfig({
  plugins: [
    stubPrismLanguageImports(),
    react(),

    /**
     * A custom plugin to convert media files to data URLs for jsdom resources: usable
     */
    {
      name: 'media-to-data-url',
      enforce: 'pre',
      load(id) {
        for (const mediaType of mediaTypes) {
          if (id.endsWith(`.${mediaType}`)) {
            console.log(`Converting media file to data URL: ${id}`)
            const src = readFileSync(id).toString('base64')
            return `export default "data:image/${mediaType};base64,${src}"`
          }
        }
      },
    },
  ],
  test: {
    setupFiles: ['./vitest.setup.ts'],
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    environment: 'jsdom',
    server: {deps: {inline: ['react-tweet']}},
    deps: {
      optimizer: {
        web: {
          include: ['vitest-canvas-mock'],
        },
      },
    },
    maxWorkers: 1,
    // jsdom: `resources: undefined` → no automatic subresource fetching (no "Could not load img" spam).
    // See https://github.com/jsdom/jsdom#loading-subresources - only `undefined`, `"usable"`, or object.
    environmentOptions: {
      jsdom: {
        resources: undefined,
      },
    },
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})

const mediaTypes = [
  'png',
  'jpg',
  'jpeg',
  'gif',
  'svg',
  'webp',
  'ico',
  'bmp',
  'avif',
  'webp',
]
