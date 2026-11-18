import { z } from 'zod'
import { defineModel, type Model } from '@/libraries/model'

export const NomDuMotif = defineModel(
  z.string().trim().min(1).brand('NomDuMotif'),
)

export type NomDuMotif = Model.TypeOf<typeof NomDuMotif>
