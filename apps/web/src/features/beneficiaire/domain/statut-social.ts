import { defineModel, type Model } from '@app/web/libraries/model'
import { z } from 'zod'

export const statutsSociaux = [
  'Scolarise',
  'SansEmploi',
  'EnEmploi',
  'Retraite',
  'NonCommunique',
] as const

export const StatutSocial = defineModel(z.enum(statutsSociaux))

export type StatutSocial = Model.TypeOf<typeof StatutSocial>

export const statutSocialLabels: Record<StatutSocial, string> = {
  Retraite: 'Retraité',
  SansEmploi: 'Sans emploi',
  EnEmploi: 'En emploi',
  Scolarise: 'Scolarisé',
  NonCommunique: 'Non communiqué ou hétérogène',
}
