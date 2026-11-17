import { z } from 'zod'
import { defineModel, type Model } from '@/libraries/model'

export const AuteurId = defineModel(z.guid().brand('AuteurId'))

export type AuteurId = Model.TypeOf<typeof AuteurId>
