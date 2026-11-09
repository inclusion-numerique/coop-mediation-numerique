import { defineModel, type Model } from '@app/web/libraries/model'
import { z } from 'zod'

export const TagId = defineModel(z.guid().brand('TagId'))

export type TagId = Model.TypeOf<typeof TagId>
