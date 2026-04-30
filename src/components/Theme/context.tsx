'use client'

import React, {
  PropsWithChildren,
  ReactElement,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react'

enum THEME {
  dark = 'DARK',
  light = 'LIGHT',
  system = 'SYSTEM',
}

interface ThemeStateContext {
  setTheme: (theme: THEME) => void
  theme: THEME
}

const ThemeContext = createContext<ThemeStateContext>({
  theme: THEME.dark,
  setTheme: () => ({}),
})

const isBrowser = typeof window !== 'undefined'

const applyTheme = (theme: THEME): void => {
  if (!isBrowser) return
  const root = document.documentElement

  let resolved: 'dark' | 'light'
  if (theme === THEME.system) {
    resolved = window.matchMedia('(prefers-color-scheme: light)').matches
      ? 'light'
      : 'dark'
  } else {
    resolved = theme === THEME.light ? 'light' : 'dark'
  }

  root.setAttribute('data-theme', resolved)

  // Tailwind dark: variants depend on the data-theme attribute via
  // src/styles/main.css `@custom-variant dark (...)`. The body `dark` class
  // is kept as a defensive fallback for any third-party CSS that looks for
  // a `.dark` ancestor.
  document.body.classList.toggle('dark', resolved === 'dark')
}

const ThemeProvider = ({
  children,
}: PropsWithChildren<Record<never, never>>): ReactElement => {
  // Default is dark — server-rendered html already has data-theme="dark".
  const [theme, _setTheme] = useState<THEME>(THEME.dark)
  const ref = useRef(theme)

  const setTheme = (next: THEME): void => {
    ref.current = next
    _setTheme(next)
    if (isBrowser) {
      window.localStorage.setItem('theme', next)
    }
  }

  const onSystemChange = useCallback(() => {
    if (ref.current === THEME.system) {
      applyTheme(THEME.system)
    }
  }, [])

  // Hydrate from localStorage once on mount.
  useEffect(() => {
    if (!isBrowser) return
    const stored = window.localStorage.getItem('theme')
    if (
      stored === THEME.dark ||
      stored === THEME.light ||
      stored === THEME.system
    ) {
      queueMicrotask(() => setTheme(stored))
    }
  }, [])

  // Apply the active theme whenever it changes.
  useLayoutEffect(() => {
    applyTheme(theme)
  }, [theme])

  // Listen for OS preference changes when in system mode.
  useEffect(() => {
    if (!isBrowser) return
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    mq.addEventListener('change', onSystemChange)
    return () => mq.removeEventListener('change', onSystemChange)
  }, [onSystemChange])

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

const useTheme = (): [THEME, (theme: THEME) => void] => {
  const { theme, setTheme } = useContext(ThemeContext)
  return [theme, setTheme]
}

export { useTheme, ThemeProvider, THEME }
