import { z } from 'zod'
import { defineModel, type Model } from '@/libraries/model'

export const NomDuCoordinateur = defineModel(
  z.string().trim().min(1).brand('NomDuCoordinateur'),
)

export type NomDuCoordinateur = Model.TypeOf<typeof NomDuCoordinateur>
