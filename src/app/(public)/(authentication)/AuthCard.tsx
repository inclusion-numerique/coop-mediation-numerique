import classNames from 'classnames'
import { PropsWithChildren } from 'react'
import styles from './AuthCard.module.css'

export const AuthCard = ({
  children,
  className,
  id,
}: PropsWithChildren<{ id?: string; className?: string }>) => (
  <div className={classNames(styles.card, className)} id={id}>
    <main role="main" className={styles.inner}>
      {children}
    </main>
  </div>
)
