import classNames from 'classnames'
import type { ReactNode } from 'react'

/**
 * Habillage DSFR d'une table (`fr-table` + wrappers). Headless : la feature
 * fournit le contenu `<thead>`/`<tbody>` via `children`.
 */
export const DataTableShell = ({
  className,
  tableClassName,
  children,
}: {
  className?: string
  tableClassName?: string
  children: ReactNode
}) => (
  <div
    className={classNames(
      'fr-table fr-border-left fr-border-right fr-border-top',
      className,
    )}
    data-fr-js-table="true"
  >
    <div className="fr-table__wrapper">
      <div className="fr-table__container">
        <div className="fr-table__content">
          <table className={tableClassName} data-fr-js-table-element="true">
            {children}
          </table>
        </div>
      </div>
    </div>
  </div>
)
