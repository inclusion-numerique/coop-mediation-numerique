import classNames from 'classnames'
import type { LiensDePagination } from '../definition'
import { LignesParPage } from './LignesParPage'
import { NavigationDePages } from './NavigationDePages'

export const PiedDeListe = ({
  liens,
  pagination,
  className,
}: {
  liens: LiensDePagination
  pagination: { readonly lignes: readonly number[]; readonly parDefaut: number }
  className?: string | undefined
}) => (
  <div
    className={classNames(
      'fr-flex fr-width-full fr-justify-content-space-between fr-align-items-center fr-direction-column fr-direction-sm-row fr-flex-gap-4v',
      className,
    )}
  >
    <LignesParPage
      pagination={{
        lignes: pagination.lignes,
        parDefaut: pagination.parDefaut,
      }}
    />
    <NavigationDePages
      liens={liens}
      className="fr-flex-grow-1 fr-justify-content-end"
    />
  </div>
)
