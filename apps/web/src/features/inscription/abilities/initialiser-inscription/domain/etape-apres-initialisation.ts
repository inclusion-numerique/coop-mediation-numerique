import {
  getInscriptionFlow,
  getNextInscriptionStep,
  InscriptionStep,
  type ProfilInscription,
} from '@app/web/features/inscription/domain'

/**
 * Décision pure de l'étape qui suit l'initialisation : dérive le type de flow de
 * la présence de données Dataspace, puis interroge la machine à états depuis
 * l'étape `initialize`.
 */
export const etapeApresInitialisation = ({
  hasDataspaceData,
  profil,
  hasLieuxActivite,
  isConseillerNumerique,
}: {
  readonly hasDataspaceData: boolean
  readonly profil: ProfilInscription | null
  readonly hasLieuxActivite: boolean
  readonly isConseillerNumerique: boolean
}): InscriptionStep | null =>
  getNextInscriptionStep(InscriptionStep('initialize'), {
    flowType: getInscriptionFlow({ hasDataspaceData }),
    profil,
    hasLieuxActivite,
    isConseillerNumerique,
  })
