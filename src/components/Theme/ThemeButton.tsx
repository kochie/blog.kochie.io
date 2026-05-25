'use client'
import React from 'react'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faLightbulbSlash,
  faLightbulbOn,
  faCogs,
} from '@fortawesome/pro-duotone-svg-icons'

import { THEME, useTheme } from './context'

const labels: Record<THEME, string> = {
  [THEME.dark]: 'Theme: dark · click for light',
  [THEME.light]: 'Theme: light · click for system',
  [THEME.system]: 'Theme: system · click for dark',
}

const nextTheme = (theme: THEME): THEME => {
  if (theme === THEME.dark) return THEME.light
  if (theme === THEME.light) return THEME.system
  return THEME.dark
}

const ThemeButton = () => {
  const [theme, setTheme] = useTheme()

  const icon =
    theme === THEME.dark
      ? faLightbulbSlash
      : theme === THEME.light
        ? faLightbulbOn
        : faCogs

  return (
    <button
      type="button"
      onClick={() => setTheme(nextTheme(theme))}
      aria-label={labels[theme]}
      title={labels[theme]}
      className="inline-flex items-center justify-center w-11 h-11 rounded cursor-pointer text-text-mute hover:text-accent transition-colors duration-fast"
    >
      <FontAwesomeIcon icon={icon} className="text-base" />
    </button>
  )
}

export default ThemeButton
