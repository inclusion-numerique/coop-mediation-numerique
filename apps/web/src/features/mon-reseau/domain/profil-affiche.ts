import { defineModel, type Model } from '@app/web/libraries/model'
import { z } from 'zod'
import type { ProfilActeur } from './acteur'

export const profilsAffiches = [
  'ConseillerNumerique',
  'Mediateur',
  'CoordinateurConseillerNumerique',
  'CoordinateurHorsDispositif',
] as const

export const ProfilAffiche = defineModel(
  z.enum(profilsAffiches).brand('ProfilAffiche'),
)

export type ProfilAffiche = Model.TypeOf<typeof ProfilAffiche>

const profilDuCoordinateur = (estConseillerNumerique: boolean) =>
  estConseillerNumerique
    ? 'CoordinateurConseillerNumerique'
    : 'CoordinateurHorsDispositif'

const profilDuMediateur = (estConseillerNumerique: boolean) =>
  estConseillerNumerique ? 'ConseillerNumerique' : 'Mediateur'

export const profilAffiche = ({
  _tag,
  dispositif,
}: ProfilActeur): ProfilAffiche =>
  ProfilAffiche(
    (_tag === 'Coordinateur' ? profilDuCoordinateur : profilDuMediateur)(
      dispositif === 'ConseillerNumerique',
    ),
  )
