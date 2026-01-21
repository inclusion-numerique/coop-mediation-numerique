import { ProfilInscription } from '@prisma/client'

export const getActeurIconUrl = (profil: ProfilInscription): string | null => {
  if (
    profil === 'CoordinateurConseillerNumerique' ||
    profil === 'Coordinateur'
  ) {
    return '/images/iconographie/profil-coordinateur-conseiller-numerique-minimal.svg'
  }

  if (profil === 'ConseillerNumerique') {
    return '/images/iconographie/profil-conseiller-numerique-minimal.svg'
  }
  return null
}
