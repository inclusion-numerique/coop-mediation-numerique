import { getDepartementCodeForLieu } from '@app/web/features/mon-reseau/getDepartementCodeForLieu'
import RemoveMediateurFromLieuButton from '@app/web/features/mon-reseau/use-cases/acteurs/components/RemoveMediateurFromLieuButton'
import { getActeurDisplayName } from '@app/web/features/mon-reseau/use-cases/acteurs/getActeurDisplayName'
import type { LieuForList } from '@app/web/features/mon-reseau/use-cases/lieux/db/searchLieux'
import { getCartographieNationaleSourceLabel } from '@app/web/structure/cartographieNationaleSources'
import Tag from '@codegouvfr/react-dsfr/Tag'
import classNames from 'classnames'
import { formatDate, isBefore, subYears } from 'date-fns'
import Link from 'next/link'
import CartographyIndicator, {
  getCartographyStatus,
} from './CartographyIndicator'
import styles from './LieuCard.module.css'

const LieuCard = ({
  lieu,
  className,
  removeMediateurFromLieu,
}: {
  lieu: LieuForList
  className?: string
  // Allow button feature to remove mediateur from lieu
  removeMediateurFromLieu?: {
    mediateurId: string
  }
}) => {
  const departementCode = getDepartementCodeForLieu(lieu)
  const mediateursCount = lieu._count.mediateursEnActivite ?? 0

  const lieuHref = `/coop/mon-reseau/${departementCode}/lieux/${lieu.id}`

  const formattedModificationDate = formatDate(
    new Date(lieu.modification),
    'dd.MM.yyyy',
  )

  const cartographyStatus = getCartographyStatus({
    visiblePourCartographieNationale: lieu.visiblePourCartographieNationale,
    structureCartographieNationaleId: lieu.structureCartographieNationaleId,
  })

  const derniereModificationPar = lieu.derniereModificationPar
    ? getActeurDisplayName(lieu.derniereModificationPar)
    : lieu.derniereModificationSource
      ? getCartographieNationaleSourceLabel(lieu.derniereModificationSource)
      : null

  const updatedMoreThanOneYearAgo = isBefore(
    new Date(lieu.modification),
    subYears(new Date(), 1),
  )

  const derniereModificationParText = derniereModificationPar
    ? `par ${derniereModificationPar}`
    : ''

  return (
    <article
      id={lieu.id}
      className={classNames(
        'fr-enlarge-link fr-border-bottom fr-pt-4v fr-px-2v fr-pb-6v',
        styles.card,
        className,
      )}
    >
      <div className="fr-flex fr-justify-content-space-between fr-align-items-center fr-mb-2v">
        {updatedMoreThanOneYearAgo ? (
          <div className="fr-flex fr-align-items-center fr-flex-gap-2v">
            <div
              className="fr-background-contrast--warning fr-border-radius--4 fr-flex fr-align-items-center fr-justify-content-center"
              style={{ height: 20, width: 20 }}
            >
              <span
                className="fr-text-default--warning fr-icon-error-warning-fill fr-icon--xs"
                aria-hidden
              />
            </div>

            <p className="fr-text--xs fr-mb-0 fr-text-default--warning">
              Dernière mise à jour il y a plus d’un an{' '}
              {derniereModificationParText}
            </p>
          </div>
        ) : (
          <p className="fr-text--xs fr-mb-0 fr-text-mention--grey">
            Mis à jour le {formattedModificationDate}{' '}
            {derniereModificationParText}
          </p>
        )}
        {removeMediateurFromLieu && (
          <RemoveMediateurFromLieuButton
            className={styles.innerLink}
            mediateurId={removeMediateurFromLieu.mediateurId}
            structureId={lieu.id}
            variant="lieu"
            mediateurDisplayName=""
            structureNom={lieu.nom}
            derniereActiviteDate={null}
          />
        )}
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
          className={styles.innerLink}
        />
        <Tag small className={styles.innerLink}>
          <span className="ri-account-circle-fill fr-mr-1v" aria-hidden />
          {mediateursCount}{' '}
          {mediateursCount === 1
            ? 'médiateur numérique référencé'
            : 'médiateurs numériques référencés'}
        </Tag>
      </div>
      <Link href={lieuHref} prefetch={false} />
    </article>
  )
}

export default LieuCard
