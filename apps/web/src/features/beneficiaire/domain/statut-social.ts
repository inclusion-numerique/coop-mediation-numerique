import { defineModel, type Model } from '@app/web/libraries/model'
import { z } from 'zod'

// Ordre aligné sur `statutSocialLabels` (ordre d'affichage historique), pour que
// les listes dérivées des valeurs et des libellés restent cohérentes.
export const statutsSociaux = [
  'Retraite',
  'SansEmploi',
  'EnEmploi',
  'Scolarise',
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
