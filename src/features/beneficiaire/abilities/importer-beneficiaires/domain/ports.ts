import type { BeneficiaireIdentifie } from '@/features/beneficiaire/domain/beneficiaire'

export type EnregistrerLesBeneficiairesImportes = (
  beneficiaires: readonly BeneficiaireIdentifie[],
) => Promise<void>

export type ImporterBeneficiairesPorts = {
  readonly enregistrerLesBeneficiairesImportes: EnregistrerLesBeneficiairesImportes
}
