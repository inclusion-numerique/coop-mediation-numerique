import { z } from 'zod'
import { defineModel, type Model } from '@/libraries/model'

export const NomComplet = defineModel(
  z.string().trim().min(1).brand('NomComplet'),
)

export type NomComplet = Model.TypeOf<typeof NomComplet>
