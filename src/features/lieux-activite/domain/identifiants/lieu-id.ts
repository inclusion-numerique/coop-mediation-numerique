import { z } from 'zod'
import { defineModel, type Model } from '@/libraries/model'

export const LieuId = defineModel(z.guid().brand('LieuId'))

export type LieuId = Model.TypeOf<typeof LieuId>
