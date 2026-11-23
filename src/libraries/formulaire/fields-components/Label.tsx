import classNames from 'classnames'
import { ComponentProps } from 'react'

export const Label = ({
  hasErrors = false,
  children,
}: ComponentProps<'label'> & { hasErrors?: boolean }) => (
  <span
    className={classNames(
      'fr-label fr-text--medium fr-mb-1v',
      hasErrors && 'fr-label--error',
    )}
  >
    {children}
  </span>
)
