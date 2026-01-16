import { labelsToOptions } from '@app/ui/components/Form/utils/options'
import type { SessionUser } from '@app/web/auth/sessionUser'
import type { ProfilInscription } from '@prisma/client'

export const profileInscriptionSlugs = {
  ConseillerNumerique: 'conseiller-numerique',
  CoordinateurConseillerNumerique: 'coordinateur-conseiller-numerique',
  Mediateur: 'mediateur',
  Coordinateur: 'coordinateur',
} as const satisfies { [key in ProfilInscription]: string }

export type ProfileInscriptionSlug =
  (typeof profileInscriptionSlugs)[ProfilInscription]

export const profileInscriptionFromSlug = {
  'conseiller-numerique': 'ConseillerNumerique',
  'coordinateur-conseiller-numerique': 'CoordinateurConseillerNumerique',
  mediateur: 'Mediateur',
  coordinateur: 'Coordinateur',
} as const satisfies { [key in ProfileInscriptionSlug]: ProfilInscription }

export const profileInscriptionLabels = {
  Mediateur: 'Médiateur·rice numérique',
  Coordinateur: 'Coordinateur·rice',
}

export const profileInscriptionConseillerNumeriqueLabels = {
  ConseillerNumerique: 'Conseiller·ère numérique',
  CoordinateurConseillerNumerique:
    'Coordinateur·rice de conseillers numériques',
} as const

export type ProfileInscriptionConseillerNumeriqueType =
  keyof typeof profileInscriptionConseillerNumeriqueLabels

export const allProfileInscriptionLabels: {
  [key in ProfilInscription]: string
} = {
  ...profileInscriptionLabels,
  ...profileInscriptionConseillerNumeriqueLabels,
}

export const lowerCaseProfileInscriptionLabels: {
  [key in ProfilInscription]: string
} = Object.fromEntries(
  Object.entries(allProfileInscriptionLabels).map(([key, value]) => [
    key,
    value.toLowerCase(),
  ]),
) as {
  [key in ProfilInscription]: string
}

export const profileInscriptionValues = Object.keys({
  ...profileInscriptionLabels,
}) as [ProfilInscription, ...ProfilInscription[]]

export const computeUserProfile = (
  user: Pick<
    SessionUser,
    'isConseillerNumerique' | 'mediateur' | 'coordinateur'
  >,
): ProfilInscription => {
  if (user.coordinateur) {
    if (user.isConseillerNumerique) {
      return 'CoordinateurConseillerNumerique'
    }

    return 'Coordinateur'
  }

  if (user.isConseillerNumerique) {
    return 'ConseillerNumerique'
  }

  return 'Mediateur'
}
