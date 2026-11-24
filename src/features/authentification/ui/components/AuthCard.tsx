import classNames from 'classnames'
import { PropsWithChildren } from 'react'

export const AuthCard = ({
  children,
  className,
  id,
}: PropsWithChildren<{ id?: string; className?: string }>) => (
  <div
    className={classNames(
      'carte-d-authentification fr-width-full fr-border fr-border-radius--8',
      className,
    )}
    id={id}
  >
    <main role="main" className="fr-mx-auto">
      {children}
    </main>
  </div>
)
