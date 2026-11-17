import { defineModel, type Model } from '@app/web/libraries/model'
import { z } from 'zod'

export const RdvId = defineModel(z.number().int().positive().brand('RdvId'))

export type RdvId = Model.TypeOf<typeof RdvId>
