import { z } from 'zod'
import { defineModel, type Model } from '@/libraries/model'

export const NIVEAUX_D_ATELIER = [
  'Debutant',
  'Intermediaire',
  'Avance',
] as const

export const NiveauDAtelier = defineModel(
  z.enum(NIVEAUX_D_ATELIER).brand('NiveauDAtelier'),
)

export type NiveauDAtelier = Model.TypeOf<typeof NiveauDAtelier>
