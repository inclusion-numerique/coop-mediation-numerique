import type { BeneficiaireIdentifie } from '@app/web/features/beneficiaire/domain/beneficiaire'
import type { BeneficiaireACreer } from '@app/web/features/beneficiaire/domain/beneficiaire-a-creer'
import type { BeneficiaireId } from '@app/web/features/beneficiaire/domain/beneficiaire-id'
import type { BeneficiaireNotFound } from '@app/web/features/beneficiaire/domain/errors'
import type { MediateurId } from '@app/web/features/beneficiaire/domain/mediateur-id'
import type { Result } from '@app/web/libraries/result'

/**
 * Input validé pour modifier un bénéficiaire identifié.
 * Même forme que la création, plus l'identifiant de la cible.
 */
export type BeneficiaireAModifier = BeneficiaireACreer & {
  readonly id: BeneficiaireId
}

export type ModifierBeneficiaire = (input: {
  beneficiaire: BeneficiaireAModifier
  mediateurId: MediateurId
}) => Promise<Result<BeneficiaireIdentifie, BeneficiaireNotFound>>
