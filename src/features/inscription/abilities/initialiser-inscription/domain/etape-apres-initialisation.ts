import {
  EtapeDInscription,
  etapeSuivante,
  type ProfilInscription,
  parcoursDInscription,
} from '@/features/inscription/domain'

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
}): EtapeDInscription | null =>
  etapeSuivante(EtapeDInscription('initialize'), {
    flowType: parcoursDInscription({ hasDataspaceData: connuDuDispositif }),
    profil,
    hasLieuxActivite,
    isConseillerNumerique,
  })
