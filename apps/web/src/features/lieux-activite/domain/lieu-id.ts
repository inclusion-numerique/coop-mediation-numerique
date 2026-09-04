import { defineModel, type Model } from '@app/web/libraries/model'
import { z } from 'zod'

export const LieuId = defineModel(z.string().uuid().brand('LieuId'))

export type LieuId = Model.TypeOf<typeof LieuId>
