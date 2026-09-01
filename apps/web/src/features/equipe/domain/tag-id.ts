import { defineModel, type Model } from '@app/web/libraries/model'
import { z } from 'zod'

export const TagId = defineModel(z.string().uuid().brand('TagId'))

export type TagId = Model.TypeOf<typeof TagId>
