import { defineModel, type Model } from '@app/web/libraries/model'
import { z } from 'zod'

const VALEURS = [
  'Scolarise',
  'SansEmploi',
  'EnEmploi',
  'Retraite',
  'NonCommunique',
] as const

export const StatutSocial = defineModel(z.enum(VALEURS).brand('StatutSocial'))

export type StatutSocial = Model.TypeOf<typeof StatutSocial>

export const statutsSociaux: readonly StatutSocial[] = VALEURS.map(StatutSocial)
