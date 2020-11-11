import React, {
  PropsWithChildren,
  ReactElement,
  createContext,
  useCallback,
  useContext,
  useEffect,
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

const ThemeProvider = ({
  children,
}: PropsWithChildren<unknown>): ReactElement => {
  const [theme, setTheme] = useState<THEME>(THEME.system)
  const value = { theme, setTheme }

  const switchToLight = useCallback(
    (e: MediaQueryListEvent): void => {
      e.matches &&
        theme === THEME.system &&
        document.body.classList.remove('dark-theme')
    },
    [theme]
  )
  const switchToDark = useCallback(
    (e: MediaQueryListEvent): void => {
      e.matches &&
        theme === THEME.system &&
        document.body.classList.add('dark-theme')
    },
    [theme]
  )

  useEffect(() => {
    window
      .matchMedia('(prefers-color-scheme: light)')
      .addEventListener('change', switchToLight)
    window
      .matchMedia('(prefers-color-scheme: dark)')
      .addEventListener('change', switchToDark)

    return (): void => {
      window
        .matchMedia('(prefers-color-scheme: dark)')
        .removeEventListener('change', switchToLight)
      window
        .matchMedia('(prefers-color-scheme: light)')
        .removeEventListener('change', switchToDark)
    }
  }, [switchToDark, switchToLight])

  useEffect(() => {
    const theme = window.localStorage.getItem('theme')
    if (theme) setTheme(theme as THEME)
  }, [])

  useEffect(() => {
    switch (theme) {
      case THEME.dark: {
        document.body.classList.add('dark-theme')
        break
      }
      case THEME.light: {
        document.body.classList.remove('dark-theme')
        break
      }
      case THEME.system: {
        if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
          document.body.classList.add('dark-theme')
        }
        if (window.matchMedia('(prefers-color-scheme: light)').matches) {
          document.body.classList.remove('dark-theme')
        }
        break
      }
    }

    window.localStorage.setItem('theme', theme)
  }, [theme])

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

const useTheme = (): ThemeStateContext => useContext(ThemeContext)

export { useTheme, ThemeProvider, THEME }
