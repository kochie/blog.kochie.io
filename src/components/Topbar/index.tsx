import React, { ReactElement } from 'react'
import Link from 'next/link'

import style from './Topbar.module.css'

const TopBar = (): ReactElement => {
  return (
    <div className="flex flex-row justify-center items-center list-none bg-gray-500 m-0 p-0 fixed w-screen z-40">
      <Link href="/authors">
        <a>
          <div className={`${style.child} ${style.heading}`}>Authors</div>
        </a>
      </Link>
      <Link href="/">
        <a>
          <div className={`${style.child} ${style.heading}`}>Articles</div>
        </a>
      </Link>
      <Link href="/tags">
        <a>
          <div className={`${style.child} ${style.heading}`}>Tags</div>
        </a>
      </Link>
    </div>
  )
}

export default TopBar
