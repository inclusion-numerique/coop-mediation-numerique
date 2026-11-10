import { defineModel, type Model } from '@app/web/libraries/model'
import { z } from 'zod'

export const STATUTS_SOCIAUX = [
  'Scolarise',
  'SansEmploi',
  'EnEmploi',
  'Retraite',
  'NonCommunique',
] as const

export const StatutSocial = defineModel(
  z.enum(STATUTS_SOCIAUX).brand('StatutSocial'),
)

export type StatutSocial = Model.TypeOf<typeof StatutSocial>

export const statutsSociaux: readonly StatutSocial[] =
  STATUTS_SOCIAUX.map(StatutSocial)
