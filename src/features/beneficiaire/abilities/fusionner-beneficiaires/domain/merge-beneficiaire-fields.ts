import type { BeneficiaireEnregistre } from '@/features/beneficiaire/domain/beneficiaire-enregistre'

const fieldsToMerge = [
  'prenom',
  'nom',
  'telephone',
  'email',
  'adresse',
  'communeResidence',
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

const NON_COMMUNIQUE = 'NonCommunique'

const estRenseignee = (value: unknown): boolean =>
  value != null &&
  value !== NON_COMMUNIQUE &&
  (typeof value !== 'string' || value.trim() !== '')

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
