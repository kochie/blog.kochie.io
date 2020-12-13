import React, { PropsWithChildren, ReactElement } from 'react'

import { Footer, Topbar } from '..'

import style from './Page.module.css'

interface PageProps {}

const Page = ({ children }: PropsWithChildren<PageProps>): ReactElement => {
  return (
    <div className={style.page}>
      <Topbar />
      <div className={style.container}>{children}</div>
      <Footer
        title={'Kochie Engineering'}
        links={[
          { name: 'me', src: 'https://me.kochie.io', goal: 'SEQGQC1X' },
          {
            name: 'linkedin',
            src: 'https://linkedin.com/in/rkkochie',
            goal: 'RMXXVNIC',
          },
        ]}
      />
    </div>
  )
}

export default Page
