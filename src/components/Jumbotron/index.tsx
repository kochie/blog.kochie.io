import React, { ReactElement } from 'react'

import style from '../../styles/jumbotron.module.scss'

interface JumbotronProps {
  background?: ReactElement
  foreground?: ReactElement
  width?: number | string
  height: number | string
}

export default ({ background, foreground, width, height }: JumbotronProps) => {
  return (
    <div className={style.container} style={{ width, height }}>
      <div className={style.background}>{background}</div>
      <div className={style.foreground}>{foreground}</div>
    </div>
  )
}
