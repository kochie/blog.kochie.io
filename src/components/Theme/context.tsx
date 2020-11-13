import React, {
  MutableRefObject,
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

function _useTheme(
  initialTheme: THEME = THEME.system
): [MutableRefObject<THEME>, (theme: THEME) => void] {
  const [theme, _setTheme] = useState<THEME>(initialTheme)
  const savedTheme = useRef<THEME>(theme)

  const setTheme = (theme: THEME): void => {
    savedTheme.current = theme
    _setTheme(theme)
  }

  return [savedTheme, setTheme]
}

const ThemeProvider = ({
  children,
}: PropsWithChildren<unknown>): ReactElement => {
  const [theme, setTheme] = _useTheme(THEME.system)
  const value = { theme: theme.current, setTheme }

  const switchToLight = useCallback((e: MediaQueryListEvent): void => {
    if (e.matches && theme.current === THEME.system) {
      console.log(theme)
      document.body.classList.remove('dark-theme')
    }
  }, [theme])

  const switchToDark = useCallback((e: MediaQueryListEvent): void => {
    if (e.matches && theme.current === THEME.system) {
      console.log(theme)
      document.body.classList.add('dark-theme')
    }
  }, [theme])

  useEffect(() => {
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
  }, [switchToDark, switchToLight])

  useEffect(() => {
    const theme = window.localStorage.getItem('theme')
    if (theme) setTheme(theme as THEME)
  })

  useEffect(() => {
    switch (theme.current) {
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

    window.localStorage.setItem('theme', theme.current)
  }, [theme])

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

const useTheme = (): ThemeStateContext => useContext(ThemeContext)

export { useTheme, ThemeProvider, THEME }
