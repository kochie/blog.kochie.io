import React, { ReactElement } from 'react'

import style from './Jumbotron.module.css'

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
    <div className={style.container} style={{ width, height }}>
      <div className={style.background}>{background}</div>
      <div className={style.foreground}>{foreground}</div>
    </div>
  )
}

export default Jumbotron
