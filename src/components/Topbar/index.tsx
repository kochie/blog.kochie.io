import React from 'react'

import style from '../../styles/Topbar.module.scss'
import Link from 'next/link'

export default () => {
  return (
    <div className={style.topbar}>
      <Link href={'/authors'}>
        <div className={`${style.child} ${style.heading}`}>Authors</div>
      </Link>
      <Link href={'/articles'}>
        <div className={`${style.child} ${style.heading}`}>Articles</div>
      </Link>
      <Link href={'/tags'}>
        <div className={`${style.child} ${style.heading}`}>Tags</div>
      </Link>
    </div>
  )
}
