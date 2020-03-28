import { ReactChild } from 'react'

import styles from '../../styles/articleCards.module.scss'

interface CardProps {
  children: ReactChild[] | ReactChild
}

export default ({ children }: CardProps) => {
  return <div className={styles.card}>{children}</div>
}
