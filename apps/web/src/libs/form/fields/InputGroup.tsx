import { ReactNode } from 'react'
import classNames from 'classnames'

export const InputGroup = ({
  className,
  children,
}: {
  className?: string
  children: ReactNode
}) => <div className={classNames('fr-input-group', className)}>{children}</div>
