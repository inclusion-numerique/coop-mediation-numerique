import type { BeneficiaireIdentifie } from '@/features/beneficiaire/domain/beneficiaire'

export type EnregistrerLeBeneficiaire = (
  beneficiaire: BeneficiaireIdentifie,
) => Promise<void>

export type CreerBeneficiairePorts = {
  readonly enregistrerLeBeneficiaire: EnregistrerLeBeneficiaire
}
