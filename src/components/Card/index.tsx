import React, { PropsWithChildren, ReactElement } from 'react'

import styles from './Card.module.css'

const Card = ({ children }: PropsWithChildren<unknown>): ReactElement => {
  return <div className={styles.card}>{children}</div>
}

export default Card
