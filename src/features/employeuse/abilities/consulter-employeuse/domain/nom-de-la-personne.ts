import { z } from 'zod'
import { defineModel, type Model } from '@/libraries/model'

export const NomDeLaPersonne = defineModel(
  z.string().trim().min(1).brand('NomDeLaPersonne'),
)

export type NomDeLaPersonne = Model.TypeOf<typeof NomDeLaPersonne>
