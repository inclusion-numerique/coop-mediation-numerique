import type { ProfilInscription } from '@prisma/client'

/**
 * Returns a user profile on current data, that can be different from the one from inscription
 */
export const getUserProfil = ({
  isConseillerNumerique,
  mediateur,
  coordinateur,
}: {
  isConseillerNumerique: boolean
  mediateur: {} | null
  coordinateur: {} | null
}): ProfilInscription => {
  if (coordinateur) {
    return isConseillerNumerique
      ? 'CoordinateurConseillerNumerique'
      : 'Coordinateur'
  }
  if (mediateur) {
    return isConseillerNumerique ? 'ConseillerNumerique' : 'Mediateur'
  }
  return 'Mediateur'
}
