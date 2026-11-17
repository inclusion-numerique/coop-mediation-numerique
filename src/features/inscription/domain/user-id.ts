import { z } from 'zod'
import { defineModel, type Model } from '@/libraries/model'

export const UserId = defineModel(z.guid().brand('UserId'))

export type UserId = Model.TypeOf<typeof UserId>
