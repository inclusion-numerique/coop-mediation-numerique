import { defineModel, type Model } from '@app/web/libraries/model'
import { z } from 'zod'

export const ProfilDuMediateur = defineModel(
  z
    .enum([
      'ConseillerNumerique',
      'Mediateur',
      'CoordinateurConseillerNumerique',
      'CoordinateurHorsDispositif',
    ])
    .brand('ProfilDuMediateur'),
)

export type ProfilDuMediateur = Model.TypeOf<typeof ProfilDuMediateur>

const profilDuCoordinateur = (estConseillerNumerique: boolean) =>
  estConseillerNumerique
    ? 'CoordinateurConseillerNumerique'
    : 'CoordinateurHorsDispositif'

const profilDeMediation = (estConseillerNumerique: boolean) =>
  estConseillerNumerique ? 'ConseillerNumerique' : 'Mediateur'

export const profilDuMediateur = ({
  estCoordinateur,
  estConseillerNumerique,
}: {
  estCoordinateur: boolean
  estConseillerNumerique: boolean
}): ProfilDuMediateur =>
  ProfilDuMediateur(
    (estCoordinateur ? profilDuCoordinateur : profilDeMediation)(
      estConseillerNumerique,
    ),
  )
