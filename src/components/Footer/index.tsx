import React, { ReactElement } from 'react'

import style from './Footer.module.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

interface FooterProps {
  title: string
  links: {
    name: string
    src: string
    goal: string
  }[]
}

const Footer = ({ title, links }: FooterProps): ReactElement => {
  const fathomGoal = (goal: string): void => {
    fathom.trackGoal(goal, 0)
  }

  return (
    <div className={style.ccontainer}>
      <div className={style.container}>
        <p>
          {title}{' '}
          <FontAwesomeIcon
            icon={['fad', 'copyright']}
            className={style.copyright}
          />{' '}
          {new Date().getFullYear()}
        </p>
        <div className={style.links}>
          {links.map((link, i: number) => {
            const classes = [style.link]
            i === 0 ? null : classes.push(style.divider)
            return (
              <div key={link.src} className={classes.join(' ')}>
                <a
                  className={style.heading}
                  href={link.src}
                  onClick={(): void => fathomGoal(link.goal)}
                >
                  {link.name}
                </a>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default Footer
