import RedAsterisk from '@app/ui/components/Form/RedAsterisk'
import classNames from 'classnames'
import type { ReactNode } from 'react'

const CraFormLabel = ({
  children,
  required,
  className,
  as: Component = 'span',
}: {
  children: ReactNode
  required?: boolean
  className?: string
  as?: 'span' | 'p'
}) => (
  <Component
    className={classNames('fr-text--medium fr-text-label--grey', className)}
  >
    {children}
    {required ? (
      <>
        &nbsp;
        <RedAsterisk />
      </>
    ) : null}
  </Component>
)

export default CraFormLabel
