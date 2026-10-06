import './src/test/sharp-mock'
import 'vitest-canvas-mock'
import '@testing-library/jest-dom/vitest'
import { afterEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'

vi.mock('next/image', () => import('./src/test/next-image'))

// Testing Library only auto-registers cleanup when `afterEach` is a global,
// and this config doesn't enable Vitest globals. Without it, rendered trees
// outlive their test and React can flush work after jsdom is torn down
// ("ReferenceError: window is not defined").
afterEach(() => cleanup())

globalThis.matchMedia ??= vi.fn().mockImplementation((query: string) => ({
  matches: false,
  media: query,
  onchange: null,
  addListener: vi.fn(),
  removeListener: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  dispatchEvent: vi.fn(),
}))

// Node can install a broken global localStorage when `--localstorage-file` is invalid.
const localStorageStore: Record<string, string> = {}
const localStorageMock: Storage = {
  getItem: (key) => (key in localStorageStore ? localStorageStore[key] : null),
  setItem: (key, value) => {
    localStorageStore[key] = value
  },
  removeItem: (key) => {
    delete localStorageStore[key]
  },
  clear: () => {
    for (const k of Object.keys(localStorageStore)) delete localStorageStore[k]
  },
  key: (index) => Object.keys(localStorageStore)[index] ?? null,
  get length() {
    return Object.keys(localStorageStore).length
  },
}

Object.defineProperty(globalThis, 'localStorage', {
  value: localStorageMock,
  writable: true,
  configurable: true,
})
