import type { SessionUser } from '@app/web/auth/sessionUser'
import type { ProfilInscription } from '@prisma/client'

/**
 * Returns a user profile on current data, that can be different from the one from inscription
 */
export const getUserProfil = ({
  mediateur,
  coordinateur,
}: {
  mediateur: null | Pick<
    Exclude<SessionUser['mediateur'], null>,
    'conseillerNumerique'
  >
  coordinateur: null | Pick<
    Exclude<SessionUser['coordinateur'], null>,
    'conseillerNumeriqueId'
  >
}): ProfilInscription => {
  if (coordinateur) {
    return coordinateur.conseillerNumeriqueId
      ? 'CoordinateurConseillerNumerique'
      : 'Coordinateur'
  }
  if (mediateur) {
    return mediateur.conseillerNumerique ? 'ConseillerNumerique' : 'Mediateur'
  }
  return 'Mediateur'
}
