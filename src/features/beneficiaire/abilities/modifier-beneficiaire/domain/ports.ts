import type { BeneficiaireIdentifie } from '@/features/beneficiaire/domain/beneficiaire'
import type { BeneficiaireId } from '@/features/beneficiaire/domain/beneficiaire-id'
import type { MediateurId } from '@/features/beneficiaire/domain/mediateur-id'
import type { BeneficiaireAEditer } from './beneficiaire-a-editer'

export type CreationDuBeneficiaire = (cible: {
  readonly id: BeneficiaireId
  readonly mediateurId: MediateurId
}) => Promise<Date | null>

export type EnregistrerLaModification = (
  beneficiaire: BeneficiaireIdentifie,
) => Promise<void>

export type ModifierBeneficiairePorts = {
  readonly creationDuBeneficiaire: CreationDuBeneficiaire
  readonly enregistrerLaModification: EnregistrerLaModification
}

export type LireBeneficiaireAEditer = (input: {
  readonly beneficiaireId: BeneficiaireId
  readonly mediateurId: MediateurId
}) => Promise<BeneficiaireAEditer | null>
