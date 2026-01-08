import type { ActeurIdentityData } from '@app/web/features/mon-reseau/use-cases/acteurs/components/ActeurIdentity'
import type { ActeurForList } from '@app/web/features/mon-reseau/use-cases/acteurs/db/searchActeurs'
import { getActeurIconUrl } from '@app/web/features/mon-reseau/use-cases/acteurs/getActeurIcon'
import { getActeurPageUrl } from '@app/web/features/mon-reseau/use-cases/acteurs/getActeurPageUrl'
import { allProfileInscriptionLabels } from '@app/web/features/utilisateurs/use-cases/registration/profilInscription'
import { getUserProfil } from '@app/web/features/utilisateurs/utils/getUserProfil'
import classNames from 'classnames'
import Link from 'next/link'

const getCoordinateurInfo = (
  acteur: ActeurIdentityData,
): { name: string; userId: string } | null => {
  const mediateur = acteur.mediateur as ActeurForList['mediateur'] | null
  const coordination = mediateur?.coordinations?.[0]
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

const ActeurProfilAndContact = ({
  acteur,
  retour,
  compact = false,
  classes,
}: {
  acteur: ActeurIdentityData
  retour?: string
  compact?: boolean
  classes?: {
    link?: string
  }
}) => {
  const coordinateurInfo = retour ? getCoordinateurInfo(acteur) : null

  const profil = getUserProfil(acteur)
  const acteurIconUrl = getActeurIconUrl(profil)

  return (
    <>
      <p
        className={classNames(
          'fr-text--sm fr-flex fr-align-items-center',
          compact ? 'fr-mb-2v' : 'fr-mb-3v',
        )}
      >
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
                'fr-link fr-link--sm fr-ml-1v fr-position-relative',
                classes?.link,
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
    </>
  )
}

export default ActeurProfilAndContact
