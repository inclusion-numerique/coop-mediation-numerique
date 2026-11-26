import type { BeneficiaireEnregistre } from '@/features/beneficiaire/domain/beneficiaire-enregistre'

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

const estRenseignee = (value: unknown): boolean =>
  value != null && (typeof value !== 'string' || value.trim() !== '')

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
