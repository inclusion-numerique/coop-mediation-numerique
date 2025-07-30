import classNames from 'classnames'
import { ReactNode } from 'react'

export const CounterCard = ({
  children,
  icon,
}: {
  children: ReactNode
  icon: string
}) => (
  <div className=" fr-px-8v fr-py-6v fr-border-radius--16 fr-background-contrast--info fr-flex fr-align-items-center fr-justify-content-space-between">
    <span className="fr-h2 fr-mb-0">{children}</span>
    <span
      className={classNames('ri-2x fr-text-default--info', icon)}
      aria-hidden="true"
    />
  </div>
)
