import React, {
  PropsWithChildren,
  ReactElement,
  createContext,
  useContext,
  useState,
} from 'react'

enum THEME {
  dark = 'DARK',
  light = 'LIGHT',
}

interface ThemeSetStateContext {
  setTheme: (theme: THEME) => void
}

interface ThemeStateContext {
  theme: THEME
}

const ThemeStateContext = createContext<ThemeStateContext>({
  theme: THEME.dark,
})
const ThemeSetStateContext = createContext<ThemeSetStateContext>({
  setTheme: () => ({}),
})

const ThemeProvider = ({
  children,
}: PropsWithChildren<unknown>): ReactElement => {
  const [theme, setState] = useState<THEME>(THEME.dark)
  const value = { setTheme: setState }
  const themeObj = { theme }
  return (
    <ThemeSetStateContext.Provider value={value}>
      <ThemeStateContext.Provider value={themeObj}>
        {children}
      </ThemeStateContext.Provider>
    </ThemeSetStateContext.Provider>
  )
}

const useTheme = (): ThemeStateContext => useContext(ThemeStateContext)
const useSetTheme = (): ThemeSetStateContext => useContext(ThemeSetStateContext)

export { useTheme, useSetTheme, ThemeProvider, THEME }
