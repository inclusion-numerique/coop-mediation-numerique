import { z } from 'zod'
import { defineModel, type Model } from '@/libraries/model'

export const NomDeFamille = defineModel(
  z.string().trim().min(1).brand('NomDeFamille'),
)

export type NomDeFamille = Model.TypeOf<typeof NomDeFamille>
