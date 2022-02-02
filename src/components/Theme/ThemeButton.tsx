import React, { ReactElement } from 'react'

// import styles from './theme.module.css'
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

  const circle = findIconDefinition({
    prefix: 'fas',
    iconName: 'circle',
  })
  // const currentIcon = useRef<HTMLDivElement>(null)

  const [theme, setTheme] = useTheme()

  const bulbOffDiv = (
    <span
      onClick={(): void => setTheme(THEME.dark)}
      className="fa-stack fa-2x"
      title={'Dark Theme'}
    >
      <FontAwesomeIcon
        icon={circle}
        className="fa-stack-2x dark:text-white text-black"
      />
      <FontAwesomeIcon icon={bulbOff} className="fa-stack-1x" />
    </span>
  )
  const bulbOnDiv = (
    <div
      onClick={(): void => setTheme(THEME.light)}
      className="fa-stack fa-2x"
      title={'Light Theme'}
    >
      <FontAwesomeIcon
        icon={circle}
        className="fa-stack-2x dark:text-white text-black"
      />
      <FontAwesomeIcon icon={bulbOn} className="fa-stack-1x" />
    </div>
  )
  const systemDiv = (
    <div
      onClick={(): void => setTheme(THEME.system)}
      className="fa-stack fa-2x"
      title={'System Theme'}
    >
      <FontAwesomeIcon
        icon={circle}
        className="fa-stack-2x dark:text-white text-black"
      />
      <FontAwesomeIcon icon={cogs} className="fa-stack-1x" />
    </div>
  )

  return (
    <div className="fixed top-0 right-0 z-50">
      <div
        className={`pr-5 pt-5 pl-10 pb-10 animate duration-300 group flex-col flex gap-4 items-center text-white dark:text-black`}
      >
        <div className="">
          <div className={`w-full h-full animate duration-300`}>
            {theme === THEME.light ? bulbOnDiv : null}
            {theme === THEME.dark ? bulbOffDiv : null}
            {theme === THEME.system ? systemDiv : null}
          </div>
        </div>

        <div className="cursor-pointer transition transform-gpu duration-300 animate group-hover:opacity-100 opacity-0 scale-0 group-hover:scale-100 ease-in-out delay-200 group-hover:delay-0">
          <div
            onClick={(): void => setTheme(THEME.dark)}
            className="w-full h-full fa-stack duration-300 animate fa-lg"
            title={'Dark Theme'}
          >
            <FontAwesomeIcon
              icon={circle}
              className="fa-stack-2x dark:text-white text-black"
            />
            <FontAwesomeIcon icon={bulbOff} className="fa-stack-1x" />
          </div>
        </div>

        <div className="cursor-pointer transition transform-gpu duration-300 animate group-hover:opacity-100 opacity-0 scale-0 group-hover:scale-100 ease-in-out delay-100">
          <div
            onClick={(): void => setTheme(THEME.light)}
            className="w-full h-full fa-stack duration-300 animate fa-lg"
            title={'Light Theme'}
          >
            <FontAwesomeIcon
              icon={circle}
              className="fa-stack-2x dark:text-white text-black"
            />
            <FontAwesomeIcon icon={bulbOn} className="fa-stack-1x" />
          </div>
        </div>

        <div className="cursor-pointer transition transform-gpu duration-300 animate group-hover:opacity-100 opacity-0 scale-0 group-hover:scale-100 ease-in-out delay-0 group-hover:delay-200">
          <div
            onClick={(): void => setTheme(THEME.system)}
            className="w-full h-full fa-stack duration-300 animate fa-lg"
            title={'System Theme'}
          >
            <FontAwesomeIcon
              icon={circle}
              className="fa-stack-2x dark:text-white text-black"
            />
            <FontAwesomeIcon icon={cogs} className="fa-stack-1x" />
          </div>
        </div>
      </div>
    </div>
  )
}

export default ThemeButton
