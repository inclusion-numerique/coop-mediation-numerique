import type { BeneficiaireId } from '@app/web/features/beneficiaire/domain/beneficiaire-id'

export type BeneficiaireSourceIntrouvable = {
  readonly _tag: 'BeneficiaireSourceIntrouvable'
  readonly id: BeneficiaireId
}

export const BeneficiaireSourceIntrouvable = (
  id: BeneficiaireId,
): BeneficiaireSourceIntrouvable => ({
  _tag: 'BeneficiaireSourceIntrouvable',
  id,
})

export type BeneficiaireDestinationIntrouvable = {
  readonly _tag: 'BeneficiaireDestinationIntrouvable'
  readonly id: BeneficiaireId
}

export const BeneficiaireDestinationIntrouvable = (
  id: BeneficiaireId,
): BeneficiaireDestinationIntrouvable => ({
  _tag: 'BeneficiaireDestinationIntrouvable',
  id,
})
