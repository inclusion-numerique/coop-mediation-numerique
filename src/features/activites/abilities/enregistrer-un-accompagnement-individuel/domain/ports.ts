import type {
  BeneficiaireId,
  MediateurId,
  SaisieDeMediationPorts,
} from '../../../domain'

export type BeneficiaireDuMediateur = (criteres: {
  readonly id: BeneficiaireId
  readonly mediateurId: MediateurId
}) => Promise<{ readonly anonyme: boolean } | null>

export type EnregistrerUnAccompagnementIndividuelPorts =
  SaisieDeMediationPorts & {
    readonly beneficiaireDuMediateur: BeneficiaireDuMediateur
  }
