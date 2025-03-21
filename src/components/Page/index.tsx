import React, { PropsWithChildren, ReactElement } from 'react'

import Footer from '@/components/Footer'
import Topbar from '@/components/Topbar'

import style from './Page.module.css'

const Page = ({
  children,
}: PropsWithChildren<Record<never, never>>): ReactElement => {
  return (
    <div className={style.page}>
      <Topbar />
      <div className={style.container}>{children}</div>
      <Footer
        title={'Kochie Engineering'}
        links={[
          { name: 'me', src: 'https://me.kochie.io' },
          {
            name: 'linkedin',
            src: 'https://linkedin.com/in/rkkochie',
          },
          {
            name: 'rss',
            src: `https://${
              process.env.NEXT_PUBLIC_PROD_URL ||
              process.env.NEXT_PUBLIC_VERCEL_URL
            }/feed/rss.xml`,
          },
        ]}
      />
    </div>
  )
}

export default Page
