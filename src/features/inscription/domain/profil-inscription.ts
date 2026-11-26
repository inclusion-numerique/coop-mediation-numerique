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
