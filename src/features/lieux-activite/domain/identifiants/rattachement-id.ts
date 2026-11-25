import { z } from 'zod'
import { defineModel, type Model } from '@/libraries/model'

export const RattachementId = defineModel(z.guid().brand('RattachementId'))

export type RattachementId = Model.TypeOf<typeof RattachementId>
