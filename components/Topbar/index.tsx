import React from 'react'

import style from '../../styles/Topbar.less'

export default () => {
  return (
    <ul className={style.topbar}>
      <li className={style.child}>
        <a>Hello</a>
      </li>
      <li className={style.child}>
        <a>There</a>
      </li>
    </ul>
  )
}
