import React from 'react'
import style from '../../styles/footer.module.scss'

interface FooterProps {
  title: string
  links: {
    name: string
    src: string
  }[]
}

export default ({ title, links }: FooterProps) => {
  return (
    <div className={style.container}>
      <p>
        {title} © {new Date().getFullYear()}
      </p>
      <div className={style.links}>
        {links.map((link, i: number) => {
          const classes = [style.link]
          i === 0 ? null : classes.push(style.divider)
          return (
            <div key={link.src} className={classes.join(' ')}>
              <a className={style.heading} href={link.src}>{link.name}</a>
            </div>
          )
        })}
      </div>
    </div>
  )
}
