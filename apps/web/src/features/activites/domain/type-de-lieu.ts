import { defineModel, type Model } from '@app/web/libraries/model'
import { z } from 'zod'

const VALEURS = ['LieuActivite', 'Domicile', 'Autre', 'ADistance'] as const

export const TypeDeLieu = defineModel(z.enum(VALEURS).brand('TypeDeLieu'))

export type TypeDeLieu = Model.TypeOf<typeof TypeDeLieu>

export const typesDeLieu: readonly TypeDeLieu[] = VALEURS.map(TypeDeLieu)
