import { defineModel, type Model } from '@app/web/libraries/model'
import { z } from 'zod'

export const profilsInscription = [
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

export const profilInscriptionSlugs: Record<ProfilInscriptionValue, string> = {
  ConseillerNumerique: 'conseiller-numerique',
  CoordinateurConseillerNumerique: 'coordinateur-conseiller-numerique',
  Mediateur: 'mediateur',
  Coordinateur: 'coordinateur',
}

/**
 * Dérive le profil d'inscription à partir des seuls signaux de rôle de
 * l'utilisateur. Fonction domaine pure : la présence d'un coordinateur prime,
 * puis le statut conseiller numérique départage. Reprend la règle historique de
 * `computeUserProfile` sans dépendre de `SessionUser`.
 */
export const computeUserProfile = ({
  isConseillerNumerique,
  aCoordinateur,
}: {
  readonly isConseillerNumerique: boolean
  readonly aCoordinateur: boolean
}): ProfilInscription =>
  aCoordinateur
    ? ProfilInscription(
        isConseillerNumerique
          ? 'CoordinateurConseillerNumerique'
          : 'Coordinateur',
      )
    : ProfilInscription(
        isConseillerNumerique ? 'ConseillerNumerique' : 'Mediateur',
      )
