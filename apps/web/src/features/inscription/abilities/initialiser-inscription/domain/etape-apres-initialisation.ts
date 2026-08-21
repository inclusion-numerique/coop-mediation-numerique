import {
  getInscriptionFlow,
  getNextInscriptionStep,
  InscriptionStep,
  type ProfilInscription,
} from '@app/web/features/inscription/domain'

/**
 * Décision pure de l'étape qui suit l'initialisation : dérive le type de flow du
 * fait que le dispositif connaisse ou non la personne, puis interroge la machine
 * à états depuis l'étape `initialize`.
 */
export const etapeApresInitialisation = ({
  connuDuDispositif,
  profil,
  hasLieuxActivite,
  isConseillerNumerique,
}: {
  readonly connuDuDispositif: boolean
  readonly profil: ProfilInscription | null
  readonly hasLieuxActivite: boolean
  readonly isConseillerNumerique: boolean
}): InscriptionStep | null =>
  getNextInscriptionStep(InscriptionStep('initialize'), {
    flowType: getInscriptionFlow({ hasDataspaceData: connuDuDispositif }),
    profil,
    hasLieuxActivite,
    isConseillerNumerique,
  })
