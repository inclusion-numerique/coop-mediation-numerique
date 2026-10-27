import { defineModel, type Model } from '@app/web/libraries/model'
import { z } from 'zod'

export const Coordination = defineModel(
  z.enum(['Coordinateur', 'SansCoordination']).brand('Coordination'),
)

export type Coordination = Model.TypeOf<typeof Coordination>

export const Dispositif = defineModel(
  z.enum(['ConseillerNumerique', 'HorsDispositif']).brand('Dispositif'),
)

export type Dispositif = Model.TypeOf<typeof Dispositif>

export type ProfilOutils = {
  readonly coordination: Coordination
  readonly dispositif: Dispositif
}
