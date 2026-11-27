import { z } from 'zod'
import { defineModel, type Model } from '@/libraries/model'

export const CourrielDeLaPersonne = defineModel(
  z.string().trim().pipe(z.email()).brand('CourrielDeLaPersonne'),
)

export type CourrielDeLaPersonne = Model.TypeOf<typeof CourrielDeLaPersonne>
