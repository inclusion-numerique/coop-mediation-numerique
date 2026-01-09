import { getDepartementCodeForActeur } from '@app/web/features/mon-reseau/getDepartementCodeForActeur'
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
): { name: string; userId: string; departementCode: string } | null => {
  const mediateur = acteur.mediateur as ActeurForList['mediateur'] | null
  const coordination = mediateur?.coordinations?.[0]
  if (!coordination?.coordinateur?.user) {
    return null
  }

  const coordinateurUser = coordination.coordinateur.user
  const { id, firstName, lastName, name } = coordinateurUser
  const displayName =
    firstName && lastName ? `${firstName} ${lastName}` : (name ?? null)

  if (!displayName) {
    return null
  }

  return {
    name: displayName,
    userId: id,
    departementCode: getDepartementCodeForActeur(coordinateurUser),
  }
}

const ActeurProfilAndContact = ({
  acteur,
  className,
  compact = false,
  classes,
}: {
  acteur: ActeurIdentityData
  departementCode: string
  compact?: boolean
  className?: string
  classes?: {
    link?: string
    contactInfo?: string
  }
}) => {
  const coordinateurInfo = getCoordinateurInfo(acteur)

  const profil = getUserProfil(acteur)
  const acteurIconUrl = getActeurIconUrl(profil)

  return (
    <div className={className}>
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
                departementCode: coordinateurInfo.departementCode,
                userId: coordinateurInfo.userId,
              })}
              prefetch={false}
            >
              {coordinateurInfo.name}
            </Link>
          </>
        )}
      </p>

      <div
        className={classNames(
          'fr-flex fr-flex-wrap fr-flex-gap-2v fr-text--sm fr-text-mention--grey fr-mb-0',
          classes?.contactInfo,
        )}
      >
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
    </div>
  )
}

export default ActeurProfilAndContact
