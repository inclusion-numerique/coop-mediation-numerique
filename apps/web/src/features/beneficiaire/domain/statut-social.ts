import { defineModel, type Model } from '@app/web/libraries/model'
import { z } from 'zod'

export const statutsSociaux = [
  'Scolarise',
  'SansEmploi',
  'EnEmploi',
  'Retraite',
  'NonCommunique',
] as const

/**
 * Un statut absent vaut `NonCommunique` : l'absence est une valeur du domaine,
 * donc le constructeur est total (accepte aussi une valeur absente).
 */
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
