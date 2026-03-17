import { getDepartementCodeForActeur } from '@app/web/features/mon-reseau/getDepartementCodeForActeur'
import type { ActeurIdentityData } from '@app/web/features/mon-reseau/use-cases/acteurs/components/ActeurIdentity'
import type { ActeurForList } from '@app/web/features/mon-reseau/use-cases/acteurs/db/searchActeurs'
import { getActeurIconUrl } from '@app/web/features/mon-reseau/use-cases/acteurs/getActeurIcon'
import { getActeurPageUrl } from '@app/web/features/mon-reseau/use-cases/acteurs/getActeurPageUrl'
import { allProfileInscriptionLabels } from '@app/web/features/utilisateurs/use-cases/registration/profilInscription'
import { getUserProfil } from '@app/web/features/utilisateurs/utils/getUserProfil'
import classNames from 'classnames'
import Link from 'next/link'

const getCoordinateursInfo = (
  acteur: ActeurIdentityData,
): { name: string; userId: string; departementCode: string }[] => {
  const mediateur = acteur.mediateur as ActeurForList['mediateur'] | null
  const coordinations = mediateur?.coordinations ?? []

  return coordinations
    .filter(
      (coordination): coordination is NonNullable<typeof coordination> =>
        !!coordination?.coordinateur?.user,
    )
    .map((coordination) => {
      const coordinateurUser = coordination.coordinateur.user
      const { id, firstName, lastName, name } = coordinateurUser
      const displayName =
        firstName && lastName ? `${firstName} ${lastName}` : (name ?? null)

      return displayName
        ? {
            name: displayName,
            userId: id,
            departementCode: getDepartementCodeForActeur(coordinateurUser),
          }
        : null
    })
    .filter((info): info is NonNullable<typeof info> => info !== null)
}

const showActeurPhoneNumberFeatureFlag = false

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
  const coordinateursInfo = getCoordinateursInfo(acteur)
  const showPhoneNumber =
    showActeurPhoneNumberFeatureFlag && Boolean(acteur.phone)

  const profil = getUserProfil(acteur)
  const acteurIconUrl = getActeurIconUrl(profil)
  const profilLabel =
    profil === 'Coordinateur'
      ? 'Coordinateur·rice hors dispositif'
      : allProfileInscriptionLabels[profil]

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
            alt={profilLabel}
            className="fr-mr-1w"
            width={18}
            height={18}
          />
        )}
        {profilLabel}
        {coordinateursInfo.length > 0 && (
          <>
            {' '}
            coordonné par{' '}
            {coordinateursInfo.map((coord, index) => (
              <span key={coord.userId}>
                <Link
                  className={classNames(
                    'fr-link fr-link--sm fr-position-relative',
                    index === 0 && 'fr-ml-1v',
                    classes?.link,
                  )}
                  href={getActeurPageUrl({
                    departementCode: coord.departementCode,
                    userId: coord.userId,
                  })}
                  prefetch={false}
                >
                  {coord.name}
                </Link>
                {index < coordinateursInfo.length - 1 && ',\u00A0'}
              </span>
            ))}
          </>
        )}
      </p>

      <div
        className={classNames(
          'fr-flex fr-flex-wrap fr-flex-gap-2v fr-text--sm fr-text-mention--grey fr-mb-0',
          classes?.contactInfo,
        )}
      >
        {showPhoneNumber && (
          <span className="fr-flex fr-align-items-center">
            <span className="ri-phone-line fr-mr-1v" aria-hidden />
            {acteur.phone}
          </span>
        )}
        {showPhoneNumber && acteur.email && <span aria-hidden>·</span>}
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
