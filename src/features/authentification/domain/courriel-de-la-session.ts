import { z } from 'zod'
import { defineModel, type Model } from '@/libraries/model'

export const CourrielDeLaSession = defineModel(
  z.string().trim().min(1).brand('CourrielDeLaSession'),
)

export type CourrielDeLaSession = Model.TypeOf<typeof CourrielDeLaSession>
