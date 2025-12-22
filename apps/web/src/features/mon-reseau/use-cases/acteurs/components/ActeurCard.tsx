import classNames from 'classnames'
import Link from 'next/link'
import type { ActeurForList } from '../db/searchActeurs'
import { acteurRoleLabels } from '../validation/ActeursFilters'
import styles from './ActeurCard.module.css'

const getActeurDisplayName = (acteur: ActeurForList): string => {
  if (acteur.firstName && acteur.lastName) {
    return `${acteur.firstName} ${acteur.lastName}`
  }
  return acteur.name ?? acteur.email ?? 'Acteur inconnu'
}

const getActeurRole = (
  acteur: ActeurForList,
): 'conseiller_numerique' | 'mediateur_numerique' | null => {
  if (acteur.mediateur?.conseillerNumerique) {
    return 'conseiller_numerique'
  }
  if (acteur.mediateur) {
    return 'mediateur_numerique'
  }
  return null
}

const getCoordinateurInfo = (
  acteur: ActeurForList,
): { name: string; userId: string } | null => {
  const coordination = acteur.mediateur?.coordinations?.[0]
  if (!coordination?.coordinateur?.user) {
    return null
  }

  const { id, firstName, lastName, name } = coordination.coordinateur.user
  const displayName =
    firstName && lastName ? `${firstName} ${lastName}` : (name ?? null)

  if (!displayName) {
    return null
  }

  return { name: displayName, userId: id }
}

const ActeurCard = ({
  acteur,
  currentPath,
}: {
  acteur: ActeurForList
  currentPath: string
}) => {
  const displayName = getActeurDisplayName(acteur)
  const role = getActeurRole(acteur)
  const coordinateurInfo = getCoordinateurInfo(acteur)
  const lieuxActiviteCount = acteur.mediateur?._count.enActivite ?? 0

  const retourParam = encodeURIComponent(currentPath)
  const acteurHref = `/coop/mon-reseau/acteurs/${acteur.id}?retour=${retourParam}`

  return (
    <div
      className={classNames(
        'fr-enlarge-link fr-border-bottom fr-pt-4v fr-px-2v fr-pb-6v',
        styles.card,
      )}
    >
      <p className="fr-text--bold fr-text--lg fr-mb-1v fr-text-title--blue-france">
        <Link href={acteurHref} prefetch={false}>
          {displayName}
        </Link>
      </p>

      {role && (
        <p className="fr-text--sm fr-mb-1v fr-flex fr-align-items-center">
          <span
            className="ri-map-pin-user-line fr-mr-1w fr-text-label--red-marianne"
            aria-hidden
          />
          {acteurRoleLabels[role]}
          {coordinateurInfo && (
            <>
              {' '}
              coordonné par{' '}
              <Link
                className={classNames(
                  'fr-link fr-link--sm fr-ml-1v',
                  styles.innerLink,
                )}
                href={`/coop/mon-reseau/acteurs/${coordinateurInfo.userId}?retour=${retourParam}`}
                prefetch={false}
              >
                {coordinateurInfo.name}
              </Link>
            </>
          )}
        </p>
      )}

      <div className="fr-flex fr-flex-wrap fr-flex-gap-2v fr-text--sm fr-text-mention--grey fr-mb-2v">
        {acteur.phone && (
          <span className="fr-flex fr-align-items-center">
            <span className="ri-phone-line fr-mr-1v" aria-hidden />
            {acteur.phone}
          </span>
        )}
        {acteur.phone && acteur.email && <span aria-hidden>·</span>}
        {acteur.email && (
          <span className="fr-flex fr-align-items-center">
            <span className="ri-mail-line fr-mr-1v" aria-hidden />
            {acteur.email}
          </span>
        )}
      </div>

      {lieuxActiviteCount > 0 && (
        <Link
          href={`/coop/mon-reseau/acteurs/${acteur.id}?retour=${retourParam}#lieux-activite`}
          prefetch={false}
          className={classNames('fr-tag fr-tag--sm', styles.innerLink)}
        >
          <span className="ri-home-office-fill fr-mr-1v" aria-hidden />
          {lieuxActiviteCount} {lieuxActiviteCount === 1 ? 'lieu' : 'lieux'}{' '}
          d'activité
        </Link>
      )}
    </div>
  )
}

export default ActeurCard
