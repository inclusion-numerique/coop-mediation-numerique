import { defineModel, type Model } from '@app/web/libraries/model'
import { z } from 'zod'

export const RechercheDeLieu = defineModel(
  z.string().trim().brand('RechercheDeLieu'),
)

export type RechercheDeLieu = Model.TypeOf<typeof RechercheDeLieu>
