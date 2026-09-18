import { defineModel, type Model } from '@app/web/libraries/model'
import { z } from 'zod'

export const LieuId = defineModel(z.guid().brand('LieuId'))

export type LieuId = Model.TypeOf<typeof LieuId>
