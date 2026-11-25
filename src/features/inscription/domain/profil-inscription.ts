import { z } from 'zod'
import { defineModel, type Model } from '@/libraries/model'

const profilsInscription = [
  'ConseillerNumerique',
  'CoordinateurConseillerNumerique',
  'Mediateur',
  'Coordinateur',
] as const

export const ProfilInscription = defineModel(
  z.enum(profilsInscription).brand('ProfilInscription'),
)

export type ProfilInscription = Model.TypeOf<typeof ProfilInscription>

/** Union des valeurs brutes (non brandées) — clés des tables de libellés/slugs. */
export type ProfilInscriptionValue = (typeof profilsInscription)[number]

export const profilInscriptionLabels: Record<ProfilInscriptionValue, string> = {
  ConseillerNumerique: 'Conseiller·ère numérique',
  CoordinateurConseillerNumerique:
    'Coordinateur·rice de conseillers numériques',
  Mediateur: 'Médiateur·rice numérique',
  Coordinateur: 'Coordinateur·rice',
}

export const libelleDuProfil = (profil: ProfilInscriptionValue): string =>
  profilInscriptionLabels[profil]

/**
 * Dérive le profil d'inscription à partir des seuls signaux de rôle de
 * l'utilisateur. Fonction domaine pure : la présence d'un coordinateur prime,
 * puis le statut conseiller numérique départage. Reprend la règle historique de
 * `computeUserProfile` sans dépendre de `SessionUser`.
 */
export const profilDInscription = ({
  isConseillerNumerique,
  isCoordinateur,
}: {
  readonly isConseillerNumerique: boolean
  readonly isCoordinateur: boolean
}): ProfilInscription =>
  isCoordinateur
    ? ProfilInscription(
        isConseillerNumerique
          ? 'CoordinateurConseillerNumerique'
          : 'Coordinateur',
      )
    : ProfilInscription(
        isConseillerNumerique ? 'ConseillerNumerique' : 'Mediateur',
      )
