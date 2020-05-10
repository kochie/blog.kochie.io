import React, { ReactElement } from 'react'

import styles from './Card.module.css'

interface CardProps {
  children: ReactElement
}

const Card = ({ children }: CardProps): ReactElement => {
  return <div className={styles.card}>{children}</div>
}

export default Card
