import classNames from 'classnames'
import { formatDate } from 'date-fns'
import Link from 'next/link'
import type { LieuForList } from '../db/searchLieux'
import CartographyIndicator, {
  getCartographyStatus,
} from './CartographyIndicator'
import styles from './LieuCard.module.css'

const LieuCard = ({
  lieu,
  departementCode,
  lieuPageRetourHref,
}: {
  lieu: LieuForList
  departementCode: string | null
  lieuPageRetourHref: string
}) => {
  const mediateursCount = lieu._count.mediateursEnActivite ?? 0

  const lieuHref = `/coop/mon-reseau/lieux/${lieu.id}?retour=${encodeURIComponent(lieuPageRetourHref)}`

  const formattedDate = formatDate(new Date(lieu.modification), 'dd.MM.yyyy')

  const acteursFilteredByLieuHref =
    departementCode != null
      ? `/coop/mon-reseau/acteurs?departement=${departementCode}&lieux=${lieu.id}`
      : `/coop/mon-reseau/acteurs?lieux=${lieu.id}`

  const cartographyStatus = getCartographyStatus({
    visiblePourCartographieNationale: lieu.visiblePourCartographieNationale,
    structureCartographieNationaleId: lieu.structureCartographieNationaleId,
  })

  return (
    <div
      className={classNames(
        'fr-enlarge-link fr-border-bottom fr-pt-4v fr-px-2v fr-pb-6v',
        styles.card,
      )}
    >
      <div className="fr-flex fr-justify-content-space-between fr-align-items-center fr-mb-2v">
        <p className="fr-text--xs fr-mb-0 fr-text-mention--grey">
          Mis à jour le {formattedDate}
        </p>
        <Link
          href={lieuHref}
          className={classNames(
            'fr-btn fr-btn--sm fr-btn--tertiary-no-outline',
            styles.innerLink,
          )}
          prefetch={false}
        >
          Modifier <span className="ri-edit-line fr-ml-1v" aria-hidden />
        </Link>
      </div>

      <p className="fr-text--bold fr-text--lg fr-mb-2v fr-text-title--blue-france">
        {lieu.nom}
      </p>

      <p className="fr-text--sm fr-mb-4v fr-text-mention--grey fr-flex fr-align-items-center">
        <span className="ri-map-pin-2-line fr-mr-1w" aria-hidden />
        {lieu.adresse}
        {lieu.complementAdresse && ` (${lieu.complementAdresse})`},{' '}
        {lieu.codePostal} {lieu.commune}
      </p>

      <div className="fr-flex fr-flex-wrap fr-flex-gap-2v fr-align-items-center">
        <CartographyIndicator
          status={cartographyStatus}
          structureCartographieNationaleId={
            lieu.structureCartographieNationaleId
          }
          structureId={lieu.id}
        />
        {mediateursCount > 0 ? (
          <Link
            href={acteursFilteredByLieuHref}
            prefetch={false}
            className={classNames('fr-tag fr-tag--sm', styles.innerLink)}
          >
            <span className="ri-account-circle-fill fr-mr-1v" aria-hidden />
            {mediateursCount}{' '}
            {mediateursCount === 1
              ? 'médiateur numérique référencé'
              : 'médiateurs numériques référencés'}
          </Link>
        ) : (
          <span className={classNames('fr-tag fr-tag--sm', styles.tagGrey)}>
            <span className="ri-account-circle-line fr-mr-1v" aria-hidden />0
            médiateurs numériques référencés
          </span>
        )}
      </div>
    </div>
  )
}

export default LieuCard
