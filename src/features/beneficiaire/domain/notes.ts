import { defineModel, type Model } from '@app/web/libraries/model'
import { z } from 'zod'

export const Notes = defineModel(z.string().trim().min(1).brand('Notes'))

export type Notes = Model.TypeOf<typeof Notes>
