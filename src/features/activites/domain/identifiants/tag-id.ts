import { z } from 'zod'
import { defineModel, type Model } from '@/libraries/model'

export const TagId = defineModel(z.guid().brand('TagId'))

export type TagId = Model.TypeOf<typeof TagId>
