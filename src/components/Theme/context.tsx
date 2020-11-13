import React, {
  PropsWithChildren,
  ReactElement,
  createContext,
  useCallback,
  useContext,
  useEffect,
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

// let i = 0

const ThemeProvider = ({
  children,
}: PropsWithChildren<Record<never, never>>): ReactElement => {
  const [theme, _setTheme] = useState<THEME>(THEME.system)
  const ref = useRef(theme)

  const setTheme = (theme: THEME): void => {
    ref.current = theme
    _setTheme(theme)
  }

  const value = { theme, setTheme }
  console.log('RENDER', theme)

  useEffect(() => {
    const switchToLight = (e: MediaQueryListEvent): void => {
      if (e.matches && theme === THEME.system) {
        console.log(theme)
        document.body.classList.remove('dark-theme')
      }
    }

    const switchToDark = (e: MediaQueryListEvent): void => {
      if (e.matches && theme === THEME.system) {
        console.log(theme)
        document.body.classList.add('dark-theme')
      }
    }
    console.log('USE EFFECT')
    window
      .matchMedia('(prefers-color-scheme: light)')
      .addEventListener('change', switchToLight)
    window
      .matchMedia('(prefers-color-scheme: dark)')
      .addEventListener('change', switchToDark)

    return (): void => {
      console.log('CLEANING')
      window
        .matchMedia('(prefers-color-scheme: light)')
        .removeEventListener('change', switchToLight)
      window
        .matchMedia('(prefers-color-scheme: dark)')
        .removeEventListener('change', switchToDark)
    }
  }, [theme])

  useEffect(() => {
    const theme = window.localStorage.getItem('theme')
    console.log('GOT THEME', theme)
    if (theme) setTheme(theme as THEME)
  }, [])

  useEffect(() => {
    switch (theme) {
      case THEME.dark: {
        document.body.classList.add('dark-theme')
        document.body.classList.add('dark')
        break
      }
      case THEME.light: {
        document.body.classList.remove('dark-theme')
        document.body.classList.remove('dark')
        break
      }
      case THEME.system: {
        if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
          document.body.classList.add('dark-theme')
          document.body.classList.add('dark')
        }
        if (window.matchMedia('(prefers-color-scheme: light)').matches) {
          document.body.classList.remove('dark-theme')
          document.body.classList.remove('dark')
        }
        break
      }
    }

    window.localStorage.setItem('theme', theme)
  }, [theme])

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

const useTheme = (): [THEME, (theme: THEME) => void] => {
  const { theme, setTheme } = useContext(ThemeContext)
  return [theme, setTheme]
}

export { useTheme, ThemeProvider, THEME }
