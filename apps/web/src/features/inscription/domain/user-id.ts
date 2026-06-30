import { defineModel, type Model } from '@app/web/libraries/model'
import { z } from 'zod'

export const UserId = defineModel(z.string().uuid().brand('UserId'))

export type UserId = Model.TypeOf<typeof UserId>
