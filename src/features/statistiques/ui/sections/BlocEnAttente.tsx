import { Spinner } from '@app/web/ui/Spinner'
import classNames from 'classnames'
import { type ReactNode, Suspense } from 'react'
import { FrontiereDErreur } from './FrontiereDErreur'

export const BlocEnAttente = ({
  children,
  className,
  attente,
}: {
  children: ReactNode
  className?: string
  attente?: ReactNode
}) => (
  <FrontiereDErreur className={className}>
    <Suspense
      fallback={
        attente ?? (
          <div
            className={classNames(
              className,
              'fr-flex fr-justify-content-center fr-align-items-center fr-py-12v',
            )}
          >
            <Spinner />
          </div>
        )
      }
    >
      {children}
    </Suspense>
  </FrontiereDErreur>
)
