import { z } from 'zod'
import { defineModel, type Model } from '@/libraries/model'

export const LieuActiviteId = defineModel(z.guid().brand('LieuActiviteId'))

export type LieuActiviteId = Model.TypeOf<typeof LieuActiviteId>
