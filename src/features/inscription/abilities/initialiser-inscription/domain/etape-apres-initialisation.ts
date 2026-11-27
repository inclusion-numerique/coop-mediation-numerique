import {
  type EtapeDInscription,
  type ProfilInscription,
  parcoursDInscription,
  premiereEtape,
} from '@/features/inscription/domain'

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
}): EtapeDInscription =>
  premiereEtape({
    flowType: parcoursDInscription({ hasDataspaceData: connuDuDispositif }),
    profil,
    hasLieuxActivite,
    isConseillerNumerique,
  })
