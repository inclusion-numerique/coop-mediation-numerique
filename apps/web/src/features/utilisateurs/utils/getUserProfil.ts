import type { ProfilInscription } from '@prisma/client'

/**
 * Returns a user profile on current data, that can be different from the one from inscription
 */
export const getUserProfil = ({
  mediateur,
  coordinateur,
}: {
  mediateur: { conseillerNumerique: {} | null } | null
  coordinateur: { conseillerNumeriqueId: string | null } | null
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
