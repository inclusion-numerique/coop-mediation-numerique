import { defineModel, type Model } from '@app/web/libraries/model'
import { z } from 'zod'

export const Trimestre = defineModel(
  z
    .object({
      annee: z.number().int(),
      rang: z.number().int().min(1).max(4),
    })
    .brand('Trimestre'),
)

export type Trimestre = Model.TypeOf<typeof Trimestre>

export const trimestreDe = (date: Date): Trimestre =>
  Trimestre({
    annee: date.getUTCFullYear(),
    rang: Math.floor(date.getUTCMonth() / 3) + 1,
  })

export const memeTrimestre = (a: Trimestre, b: Trimestre): boolean =>
  a.annee === b.annee && a.rang === b.rang

export const plusRecentDAbord = (a: Trimestre, b: Trimestre): number =>
  b.annee - a.annee || b.rang - a.rang
