import { getActeurIconUrl } from '@app/web/features/mon-reseau/use-cases/acteurs/getActeurIcon'
import { allProfileInscriptionLabels } from '@app/web/features/utilisateurs/use-cases/registration/profilInscription'
import { getUserProfil } from '@app/web/features/utilisateurs/utils/getUserProfil'
import classNames from 'classnames'
import Link from 'next/link'
import type { ActeurForList } from '../db/searchActeurs'
import { getActeurPageUrl } from '../getActeurPageUrl'
import styles from './ActeurCard.module.css'

const getActeurDisplayName = (acteur: ActeurForList): string => {
  if (acteur.firstName && acteur.lastName) {
    return `${acteur.firstName} ${acteur.lastName}`
  }
  return acteur.name ?? acteur.email ?? 'Acteur inconnu'
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
  const profil = getUserProfil(acteur)
  const coordinateurInfo = getCoordinateurInfo(acteur)
  const lieuxActiviteCount = acteur.mediateur?._count.enActivite ?? 0

  const retour = `${currentPath}#${acteur.id}`

  const acteurPageUrl = getActeurPageUrl({
    userId: acteur.id,
    retour,
    anchor: acteur.id,
  })

  const acteurIconUrl = getActeurIconUrl(profil)

  return (
    <article
      id={acteur.id}
      className={classNames(
        'fr-enlarge-link fr-border-bottom fr-pt-4v fr-px-2v fr-pb-6v',
        styles.card,
      )}
    >
      <p className="fr-text--bold fr-text--lg fr-mb-2v fr-text-title--blue-france">
        <Link href={acteurPageUrl} prefetch={false}>
          {displayName}
        </Link>
      </p>

      <p className="fr-text--sm fr-mb-2v fr-flex fr-align-items-center">
        {!!acteurIconUrl && (
          <img
            src={acteurIconUrl}
            alt={allProfileInscriptionLabels[profil]}
            className="fr-mr-1w"
            width={18}
            height={18}
          />
        )}
        {allProfileInscriptionLabels[profil]}
        {coordinateurInfo && (
          <>
            {' '}
            coordonné par{' '}
            <Link
              className={classNames(
                'fr-link fr-link--sm fr-ml-1v',
                styles.innerLink,
              )}
              href={getActeurPageUrl({
                userId: coordinateurInfo.userId,
                retour,
              })}
              prefetch={false}
            >
              {coordinateurInfo.name}
            </Link>
          </>
        )}
      </p>

      <div className="fr-flex fr-flex-wrap fr-flex-gap-2v fr-text--sm fr-text-mention--grey fr-mb-4v">
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
          href={getActeurPageUrl({
            userId: acteur.id,
            retour,
            anchor: 'lieux-activite',
          })}
          prefetch={false}
          className={classNames('fr-tag fr-tag--sm', styles.innerLink)}
        >
          <span className="ri-home-office-fill fr-mr-1v" aria-hidden />
          {lieuxActiviteCount} {lieuxActiviteCount === 1 ? 'lieu' : 'lieux'}{' '}
          d’activité
        </Link>
      )}
    </article>
  )
}

export default ActeurCard
