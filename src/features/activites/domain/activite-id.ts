import { defineModel, type Model } from '@app/web/libraries/model'
import { z } from 'zod'

export const ActiviteId = defineModel(z.guid().brand('ActiviteId'))

export type ActiviteId = Model.TypeOf<typeof ActiviteId>
