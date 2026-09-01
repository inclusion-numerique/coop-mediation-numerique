import { defineModel, type Model } from '@app/web/libraries/model'
import { z } from 'zod'

/**
 * Les politiques de rétention qui effacent un compte sans décision humaine.
 *
 * Chacune nomme une population et l'échéance au terme de laquelle ses comptes
 * sont anonymisés — « inscrit mais jamais actif » l'est à J+105. La politique
 * « inscription jamais terminée » n'y figure pas : elle fait un DELETE physique
 * et ne passe donc pas par cet effacement.
 */
export const retentionPolicies = ['InscritJamaisActif'] as const

export type NomRetentionPolicy = (typeof retentionPolicies)[number]

export const RetentionPolicy = defineModel(
  z.enum(retentionPolicies).brand('RetentionPolicy'),
)

export type RetentionPolicy = Model.TypeOf<typeof RetentionPolicy>
