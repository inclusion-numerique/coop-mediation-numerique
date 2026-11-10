import { defineModel, type Model } from '@app/web/libraries/model'
import { z } from 'zod'

export const NIVEAUX_D_ATELIER = [
  'Debutant',
  'Intermediaire',
  'Avance',
] as const

export const NiveauDAtelier = defineModel(
  z.enum(NIVEAUX_D_ATELIER).brand('NiveauDAtelier'),
)

export type NiveauDAtelier = Model.TypeOf<typeof NiveauDAtelier>

export const niveauxDAtelier: readonly NiveauDAtelier[] =
  NIVEAUX_D_ATELIER.map(NiveauDAtelier)
