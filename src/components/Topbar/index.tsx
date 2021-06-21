import React, { ReactElement } from 'react'
import Link from 'next/link'

import style from './Topbar.module.css'

const TopBar = (): ReactElement => {
  return (
    <div className="flex flex-row justify-center items-center list-none bg-gray-500 m-0 p-0 fixed w-screen z-40">
      <Link href={'/authors'} passHref>
        <div className={`${style.child} ${style.heading}`}>Authors</div>
      </Link>
      <Link href={'/'} passHref>
        <div className={`${style.child} ${style.heading}`}>Articles</div>
      </Link>
      <Link href={'/tags'} passHref>
        <div className={`${style.child} ${style.heading}`}>Tags</div>
      </Link>
    </div>
  )
}

export default TopBar
