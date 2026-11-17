import { z } from 'zod'
import { defineModel, type Model } from '@/libraries/model'

export const ActiviteId = defineModel(z.guid().brand('ActiviteId'))

export type ActiviteId = Model.TypeOf<typeof ActiviteId>
