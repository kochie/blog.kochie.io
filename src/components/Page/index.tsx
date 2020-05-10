import React, { ReactElement } from 'react'

import { Footer, Topbar } from '..'

import style from './Page.module.css'

interface PageProps {
  children: ReactElement
}

const Page = ({ children }: PageProps): React.ReactElement => {
  return (
    <div className={style.page}>
      <Topbar />
      <div className={style.container}>{children}</div>
      <Footer
        title={'Kochie Engineering'}
        links={[
          { name: 'me', src: 'https://me.kochie.io' },
          { name: 'linkedin', src: 'https://linkedin.com/in/rkkochie' },
        ]}
      />
    </div>
  )
}

export default Page
