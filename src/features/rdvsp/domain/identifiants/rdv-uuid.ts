import { z } from 'zod'
import { defineModel, type Model } from '@/libraries/model'

export const RdvUuid = defineModel(z.guid().brand('RdvUuid'))

export type RdvUuid = Model.TypeOf<typeof RdvUuid>
