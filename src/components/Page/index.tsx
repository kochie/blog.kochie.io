import { Footer, Topbar } from '..'

import style from './page.module.css'

interface PageProps {
  children: React.ReactElement
}

export default ({ children }: PageProps) => {
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
