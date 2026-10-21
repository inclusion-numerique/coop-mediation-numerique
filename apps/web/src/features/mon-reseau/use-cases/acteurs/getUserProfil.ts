import type { ProfilInscription } from '@app/web/generated/prisma/client'

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
