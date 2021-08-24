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
  // const currentIcon = useRef<HTMLDivElement>(null)

  const [theme, setTheme] = useTheme()

  const bulbOffDiv = (
    <div
      onClick={(): void => setTheme(THEME.dark)}
      className="w-full h-full fa-stack"
      title={'Dark Theme'}
    >
      <FontAwesomeIcon icon={bulbOff} size={'2x'} className="fa-stack-1x" />
    </div>
  )
  const bulbOnDiv = (
    <div
      onClick={(): void => setTheme(THEME.light)}
      className="w-full h-full fa-stack"
      title={'Light Theme'}
    >
      <FontAwesomeIcon icon={bulbOn} size={'2x'} className="fa-stack-1x" />
    </div>
  )
  const systemDiv = (
    <div
      onClick={(): void => setTheme(THEME.system)}
      className="w-full h-full fa-stack"
      title={'System Theme'}
    >
      <FontAwesomeIcon icon={cogs} size={'2x'} className="fa-stack-1x" />
    </div>
  )

  return (
    <div className="fixed top-0 right-0 z-50">
      <div
        className={`pr-5 pt-5 pl-10 pb-10 animate duration-300 group flex-col flex gap-4 items-center text-white dark:text-black`}
      >
        <div className="relative w-16 h-16 rounded-full bg-gray-900 dark:bg-white shadow-2xl cursor-pointer">
          <div
            className={`w-full h-full fa-stack bg-gray-900 dark:bg-white rounded-full animate duration-300`}
          >
            {theme === THEME.light ? bulbOnDiv : null}
            {theme === THEME.dark ? bulbOffDiv : null}
            {theme === THEME.system ? systemDiv : null}
          </div>
        </div>

        <div className="relative w-12 h-12 rounded-full shadow-2xl cursor-pointer transition transform-gpu duration-300 animate group-hover:opacity-100 opacity-0 scale-0 group-hover:scale-100 ease-in-out delay-200 group-hover:delay-0">
          <div
            onClick={(): void => setTheme(THEME.dark)}
            className="w-full h-full fa-stack bg-gray-900 dark:bg-white rounded-full duration-300 animate"
            title={'Dark Theme'}
          >
            <FontAwesomeIcon icon={bulbOff} size="lg" className="fa-stack-1x" />
          </div>
        </div>

        <div className="relative w-12 h-12 rounded-full shadow-2xl cursor-pointer transition transform-gpu duration-300 animate group-hover:opacity-100 opacity-0 scale-0 group-hover:scale-100 ease-in-out delay-100">
          <div
            onClick={(): void => setTheme(THEME.light)}
            className="w-full h-full fa-stack bg-gray-900 dark:bg-white rounded-full duration-300 animate"
            title={'Light Theme'}
          >
            <FontAwesomeIcon icon={bulbOn} size="lg" className="fa-stack-1x" />
          </div>
        </div>

        <div className="relative w-12 h-12 rounded-full shadow-2xl cursor-pointer transition transform-gpu duration-300 animate group-hover:opacity-100 opacity-0 scale-0 group-hover:scale-100 ease-in-out delay-0 group-hover:delay-200">
          <div
            onClick={(): void => setTheme(THEME.system)}
            className="w-full h-full fa-stack bg-gray-900 dark:bg-white rounded-full duration-300 animate"
            title={'System Theme'}
          >
            <FontAwesomeIcon icon={cogs} size="lg" className="fa-stack-1x" />
          </div>
        </div>
      </div>
    </div>
  )
}

export default ThemeButton
