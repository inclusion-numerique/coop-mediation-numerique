import { z } from 'zod'
import { defineModel, type Model } from '@/libraries/model'

export const RoleMembre = defineModel(
  z.enum(['ConseillerNumerique', 'MediateurNumerique']).brand('RoleMembre'),
)

export type RoleMembre = Model.TypeOf<typeof RoleMembre>

export const roleMembre = (conseillerNumerique: boolean): RoleMembre =>
  RoleMembre(conseillerNumerique ? 'ConseillerNumerique' : 'MediateurNumerique')
