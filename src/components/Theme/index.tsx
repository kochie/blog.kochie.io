import React, { ReactElement, useState, useEffect, useRef } from 'react'

import styles from './theme.module.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { findIconDefinition } from '@fortawesome/fontawesome-svg-core'

enum THEME {
  dark = 'DARK',
  light = 'LIGHT',
}

export default function Theme(): ReactElement {
  const isDarkMode = (): boolean => {
    if (window.localStorage.getItem('theme') === null) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches
    }
    return window.localStorage.getItem('theme') === THEME.dark
  }

  const currentIcon = useRef<HTMLDivElement>(null)

  const [theme, setTheme] = useState<THEME>(THEME.dark)
  // const [animateMoon, setMoonAnimation] = useState(false)
  // const [animateSun, setSunAnimation] = useState(false)
  const bulbOff = findIconDefinition({
    prefix: 'fad',
    iconName: 'lightbulb-slash',
  })

  const bulbOn = findIconDefinition({
    prefix: 'fad',
    iconName: 'lightbulb-on',
  })

  const toggleMode = (newTheme: THEME): void => {
    if (newTheme === THEME.light) {
      document.body.classList.remove('dark-theme')
    } else if (newTheme === THEME.dark) {
      document.body.classList.add('dark-theme')
    }

    // setMoonAnimation(!anima)
    // setSunAnimation(!animateSun)
    setTheme(newTheme)
  }

  useEffect(() => {
    if (isDarkMode()) document.body.classList.add('dark-theme')

    setTheme(isDarkMode() ? THEME.dark : THEME.light)

    const switchToLight = (e: MediaQueryListEvent): boolean =>
      !!(e.matches && toggleMode(THEME.light))
    const switchToDark = (e: MediaQueryListEvent): boolean =>
      !!(e.matches && toggleMode(THEME.dark))

    window
      .matchMedia('(prefers-color-scheme: dark)')
      .addEventListener('change', switchToDark)
    window
      .matchMedia('(prefers-color-scheme: light)')
      .addEventListener('change', switchToLight)

    return (): void => {
      window
        .matchMedia('(prefers-color-scheme: light)')
        .removeEventListener('change', switchToDark)
      window
        .matchMedia('(prefers-color-scheme: dark)')
        .removeEventListener('change', switchToLight)
    }
  }, [])

  useEffect(() => {
    window.localStorage.setItem('theme', theme)
  }, [theme])

  const sunDiv = (
    <div
      onClick={(): void => {
        // setSunAnimation(true)
        toggleMode(THEME.dark)
      }}
      // onAnimationEnd={(): void => setSunAnimation(false)}
      className={`${styles.iconDiv}`}
    >
      <FontAwesomeIcon
        icon={bulbOff}
        size={'2x'}
        transform={{ x: 5, y: 7.5 }}
      />
    </div>
  )
  const moonDiv = (
    <div
      onClick={(): void => {
        // setMoonAnimation(true)
        toggleMode(THEME.light)
      }}
      // onAnimationEnd={(): void => setMoonAnimation(false)}
      className={`${styles.iconDiv}`}
    >
      <FontAwesomeIcon icon={bulbOn} size={'2x'} transform={{ x: 5, y: 7.5 }} />
    </div>
  )

  return (
    <div className={styles.button} ref={currentIcon}>
      {theme === THEME.light ? sunDiv : null}
      {theme === THEME.dark ? moonDiv : null}
    </div>
  )
}
