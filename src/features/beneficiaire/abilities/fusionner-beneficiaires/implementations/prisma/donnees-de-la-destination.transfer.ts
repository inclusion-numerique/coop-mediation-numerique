import type { MergeableBeneficiaire } from '../../domain/merge-beneficiaire-fields'

export const donneesDeLaDestinationEnBase = ({
  communeResidence,
  ...donnees
}: Partial<MergeableBeneficiaire>) => ({
  ...donnees,
  ...(communeResidence === undefined || communeResidence === null
    ? {}
    : {
        commune: communeResidence.commune,
        communeCodePostal: communeResidence.codePostal,
        communeCodeInsee: communeResidence.codeInsee,
      }),
})
