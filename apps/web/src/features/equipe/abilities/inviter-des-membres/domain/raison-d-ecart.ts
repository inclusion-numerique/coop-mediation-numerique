import { defineModel, type Model } from '@app/web/libraries/model'
import { z } from 'zod'

export const RaisonDEcart = defineModel(
  z.enum(['DejaMembre', 'DejaInvitee']).brand('RaisonDEcart'),
)

export type RaisonDEcart = Model.TypeOf<typeof RaisonDEcart>
