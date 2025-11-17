import classNames from 'classnames'
import { PropsWithChildren } from 'react'

const CoopPageContainer = ({
  size = 59,
  children,
  className,
}: PropsWithChildren<{
  size?: 59 | 56 | 49 | 64 | 'full'
  className?: string
}>) => (
  <div className={classNames(`contentContainer--${size}`, className)}>
    {children}
  </div>
)

export default CoopPageContainer
