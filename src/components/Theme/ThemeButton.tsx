import React, { ReactElement, useRef } from 'react'

import styles from './theme.module.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { findIconDefinition } from '@fortawesome/fontawesome-svg-core'
import { THEME, useTheme } from './context'

const ThemeButton = (): ReactElement => {
  const bulbOff = findIconDefinition({
    prefix: 'fad',
    iconName: 'lightbulb-slash',
  })

  const bulbOn = findIconDefinition({
    prefix: 'fad',
    iconName: 'lightbulb-on',
  })

  const cogs = findIconDefinition({
    prefix: 'fad',
    iconName: 'cogs',
  })
  const currentIcon = useRef<HTMLDivElement>(null)

  const [theme, setTheme] = useTheme()

  const bulbOffDiv = (
    <div
      onClick={(): void => setTheme(THEME.dark)}
      className={`${styles.iconDiv}`}
      title={'Dark Theme'}
    >
      <FontAwesomeIcon
        icon={bulbOff}
        size={'2x'}
        transform={{ x: 5, y: 7.5 }}
      />
    </div>
  )
  const bulbOnDiv = (
    <div
      onClick={(): void => setTheme(THEME.light)}
      className={`${styles.iconDiv}`}
      title={'Light Theme'}
    >
      <FontAwesomeIcon icon={bulbOn} size={'2x'} transform={{ x: 5, y: 7.5 }} />
    </div>
  )
  const systemDiv = (
    <div
      onClick={(): void => setTheme(THEME.system)}
      className={`${styles.iconDiv}`}
      title={'System Theme'}
    >
      <FontAwesomeIcon icon={cogs} size={'2x'} transform={{ x: 5, y: 7.5 }} />
    </div>
  )

  return (
    <div className={styles.button} ref={currentIcon}>
      {theme === THEME.light ? bulbOffDiv : null}
      {theme === THEME.dark ? systemDiv : null}
      {theme === THEME.system ? bulbOnDiv : null}
    </div>
  )
}

export default ThemeButton
