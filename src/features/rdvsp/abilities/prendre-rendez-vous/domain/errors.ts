import type { ErreurRdvApi } from '../../../domain/errors'
import type { BeneficiaireCibleId } from './beneficiaire-cible'

export type BeneficiaireIntrouvable = {
  readonly _tag: 'BeneficiaireIntrouvable'
  readonly id: BeneficiaireCibleId
}

export const BeneficiaireIntrouvable = (
  id: BeneficiaireCibleId,
): BeneficiaireIntrouvable => ({ _tag: 'BeneficiaireIntrouvable', id })

export type EchecDePrendreRendezVous = BeneficiaireIntrouvable | ErreurRdvApi
