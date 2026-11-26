import { z } from 'zod'
import { defineModel, type Model } from '@/libraries/model'

export const statutsSociaux = [
  'Retraite',
  'SansEmploi',
  'EnEmploi',
  'Scolarise',
  'NonCommunique',
] as const

export const StatutSocial = defineModel(
  z
    .enum(statutsSociaux)
    .nullish()
    .transform((value) => value ?? 'NonCommunique'),
)

export type StatutSocial = Model.TypeOf<typeof StatutSocial>

export const statutSocialLabels: Record<StatutSocial, string> = {
  Retraite: 'Retraité',
  SansEmploi: 'Sans emploi',
  EnEmploi: 'En emploi',
  Scolarise: 'Scolarisé',
  NonCommunique: 'Non communiqué ou hétérogène',
}
