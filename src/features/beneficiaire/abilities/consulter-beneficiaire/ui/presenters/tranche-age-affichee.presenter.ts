import type { AnneeNaissance } from '@/features/beneficiaire/domain/annee-naissance'
import {
  effectiveTrancheAge,
  type TrancheAge,
  trancheAgeLabels,
} from '@/features/beneficiaire/domain/tranche-age'

export const trancheAgeAffichee = (
  {
    anneeNaissance,
    trancheAge,
  }: {
    readonly anneeNaissance: AnneeNaissance | null
    readonly trancheAge: TrancheAge | null
  },
  maintenant: Date,
): string => {
  const tranche = effectiveTrancheAge(anneeNaissance, trancheAge, maintenant)
  return tranche === null ? '-' : trancheAgeLabels[tranche]
}
