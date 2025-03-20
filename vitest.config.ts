import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'url'
import { readFileSync } from 'fs'

export default defineConfig({
  plugins: [
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
    environment: 'jsdom',
    deps: {
      optimizer: {
        web: {
          include: ['vitest-canvas-mock'],
        },
      },
    },
    poolOptions: {
      threads: {
        singleThread: true,
      },
    },
    environmentOptions: {
      jsdom: {
        resources: 'usable',
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
