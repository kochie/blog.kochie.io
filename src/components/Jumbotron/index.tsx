import React, { ReactElement } from 'react'

// import style from './Jumbotron.module.css'

interface JumbotronProps {
  background?: ReactElement
  foreground?: ReactElement
  width?: number | string
  height: number | string
}

const Jumbotron = ({
  background,
  foreground,
  width,
  height,
}: JumbotronProps): ReactElement => {
  return (
    <div
      className="bg-black overflow-hidden relative"
      style={{ width, height }}
    >
      <div className="relative filter brightness-75 blur-sm w-full h-full transform-gpu scale-110">
        {background}
      </div>
      <div className="relative -top-full w-full h-full">{foreground}</div>
    </div>
  )
}

export default Jumbotron
