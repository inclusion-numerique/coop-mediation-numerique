import type {
  ActiviteId,
  BeneficiaireId,
  MediateurId,
  TypeDActivite,
} from '../../../domain'

export type ActiviteDeMediationASupprimer = {
  readonly id: ActiviteId
  readonly type: TypeDActivite
  readonly suivis: readonly BeneficiaireId[]
  readonly anonymesOrphelins: readonly BeneficiaireId[]
}

export type SuppressionDeLActiviteDeMediation = {
  readonly activite: ActiviteDeMediationASupprimer
  readonly suppression: Date
}

export type ActiviteDeMediationDuMediateur = (criteres: {
  readonly id: ActiviteId
  readonly mediateurId: MediateurId
}) => Promise<ActiviteDeMediationASupprimer | null>

export type SupprimerLActiviteDeMediation = (
  suppression: SuppressionDeLActiviteDeMediation,
) => Promise<void>

export type SupprimerUneActiviteDeMediationPorts = {
  readonly activiteDuMediateur: ActiviteDeMediationDuMediateur
  readonly supprimer: SupprimerLActiviteDeMediation
}
