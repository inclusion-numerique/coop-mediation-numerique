import { defineModel, type Model } from '@app/web/libraries/model'
import { z } from 'zod'

const VALEURS = ['Debutant', 'Intermediaire', 'Avance'] as const

export const NiveauDAtelier = defineModel(
  z.enum(VALEURS).brand('NiveauDAtelier'),
)

export type NiveauDAtelier = Model.TypeOf<typeof NiveauDAtelier>

export const niveauxDAtelier: readonly NiveauDAtelier[] =
  VALEURS.map(NiveauDAtelier)
