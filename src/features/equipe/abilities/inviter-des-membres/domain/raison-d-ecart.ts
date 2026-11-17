import { z } from 'zod'
import { defineModel, type Model } from '@/libraries/model'

export const RaisonDEcart = defineModel(
  z.enum(['DejaMembre', 'DejaInvitee']).brand('RaisonDEcart'),
)

export type RaisonDEcart = Model.TypeOf<typeof RaisonDEcart>
