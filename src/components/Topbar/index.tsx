import React from 'react'
import Link from 'next/link'

import style from './Topbar.module.css'

const TopBar = (): React.ReactElement => {
  return (
    <div className={style.topbar}>
      <Link href={'/authors'}>
        <div className={`${style.child} ${style.heading}`}>Authors</div>
      </Link>
      <Link href={'/'}>
        <div className={`${style.child} ${style.heading}`}>Articles</div>
      </Link>
      <Link href={'/tags'}>
        <div className={`${style.child} ${style.heading}`}>Tags</div>
      </Link>
    </div>
  )
}

export default TopBar
