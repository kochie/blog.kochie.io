'use client'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowToTop } from '@fortawesome/pro-duotone-svg-icons'
import { useCallback, useEffect, useState } from 'react'
import clsx from "clsx";

export default function TopButton() {
  const [atTop, setTop] = useState(true)
  const [pc, setPc] = useState(0)

  const scrollListener = useCallback(() => {
    if (window.scrollY > 0 && atTop) setTop(false)
    if (window.scrollY === 0 && !atTop) setTop(true)

    const scrollElement = document.documentElement
    const progress = scrollElement.scrollTop / (scrollElement.scrollHeight - scrollElement.clientHeight)

    setPc(progress)
  }, [atTop])

  useEffect(() => {
    window.addEventListener('scroll', scrollListener)

    return () => {
      window.removeEventListener('scroll', scrollListener)
    }
  }, [scrollListener])

  useEffect(() => {
    document.getElementById('topButtonContainer')?.classList.remove('invisible')
  }, [])

  return (
    <div id="topButtonContainer" className={'invisible'}>
      <div
        className={clsx(
          "fixed bottom-6 right-6 h-20 w-20 bg-green-500 rounded-full z-10 group", 
          atTop ? 'animate-bounce-out' : 'animate-bounce-in'
        )}
      >
        <div style={{ transform: 'rotate(90deg) scaleX(-1)' }}>
          <svg viewBox="0 0 50 50">
            <circle
              className="progress-circle"
              cx="25"
              cy="25"
              r="22"
              fill="transparent"
              stroke="red"
              strokeWidth={6}
              strokeDasharray={138.16}
              strokeDashoffset={138.16 * pc}
            />
          </svg>
        </div>
        <div
          className={`absolute top-2 left-2 bg-white rounded-full h-16 w-16 shadow-2xl cursor-pointer`}
          onClick={() => {
            window.scrollTo({ top: 0, behavior: 'smooth' })
          }}
        >
          <FontAwesomeIcon
            icon={faArrowToTop}
            className="fa-stack-1x group-hover:animate-bounce-orig text-black"
            size="2x"
          />
        </div>
      </div>
    </div>
  )
}
