import type {
  BeneficiaireId,
  MediateurId,
  SaisieDeMediationPorts,
} from '../../../domain'

export type NombreDeSuivisDuMediateur = (criteres: {
  readonly ids: readonly BeneficiaireId[]
  readonly mediateurId: MediateurId
}) => Promise<number>

export type EnregistrerUnAtelierCollectifPorts = SaisieDeMediationPorts & {
  readonly nombreDeSuivisDuMediateur: NombreDeSuivisDuMediateur
}
