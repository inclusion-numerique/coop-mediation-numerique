import type { BeneficiaireEnregistre } from '@/features/beneficiaire/domain/beneficiaire-enregistre'

// Politique de fusion : champs « remplissables ». Pour chacun, on garde la
// valeur de la destination si elle est présente, sinon on comble depuis la
// source. L'ordre n'a pas d'importance (chaque champ est indépendant).
const fieldsToMerge = [
  'prenom',
  'nom',
  'telephone',
  'email',
  'adresse',
  'commune',
  'communeCodePostal',
  'communeCodeInsee',
  'notes',
  'pasDeTelephone',
  'anneeNaissance',
  'rdvServicePublicId',
  'rdvUserId',
  'genre',
  'trancheAge',
  'statutSocial',
] as const satisfies readonly (keyof BeneficiaireEnregistre)[]

export type MergeableBeneficiaire = Pick<
  BeneficiaireEnregistre,
  (typeof fieldsToMerge)[number]
>

// Une valeur absente = null, undefined ou chaîne vide/espaces. Un booléen
// `false` ou un nombre `0` sont des valeurs présentes.
export const estRenseignee = (value: unknown): boolean => {
  if (value === null || value === undefined) return false
  if (typeof value === 'string') return value.trim() !== ''
  return true
}

export const mergeBeneficiaireFields = (
  source: MergeableBeneficiaire,
  destination: MergeableBeneficiaire,
): Partial<MergeableBeneficiaire> =>
  fieldsToMerge.reduce<Partial<MergeableBeneficiaire>>(
    (merged, field) => ({
      ...merged,
      ...(estRenseignee(destination[field])
        ? { [field]: destination[field] }
        : estRenseignee(source[field])
          ? { [field]: source[field] }
          : {}),
    }),
    {},
  )
