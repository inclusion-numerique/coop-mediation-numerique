import type { ComponentProps } from 'react'
import classNames from 'classnames'

const labelClass = 'fr-label fr-mb-1v fr-text--medium fr-mb-3v'

export type LabelProps = ComponentProps<'label'>

export const Label = ({ className, children, ...props }: LabelProps) => (
  <span className={classNames(labelClass, className)} {...props}>
    {children}
  </span>
)
