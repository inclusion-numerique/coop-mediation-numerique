import { defineModel, type Model } from '@app/web/libraries/model'
import { z } from 'zod'

export const LieuActiviteId = defineModel(z.guid().brand('LieuActiviteId'))

export type LieuActiviteId = Model.TypeOf<typeof LieuActiviteId>
