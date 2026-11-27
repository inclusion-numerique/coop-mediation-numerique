import type {
  ActiviteId,
  BeneficiaireId,
  MediateurId,
  TypeDActivite,
} from '../../../domain'

export type ParticipantDeLActivite = {
  readonly beneficiaireId: BeneficiaireId
  readonly anonyme: boolean
  readonly autresAccompagnements: number
}

export type ActiviteDeMediationLue = {
  readonly id: ActiviteId
  readonly type: TypeDActivite
  readonly participants: readonly ParticipantDeLActivite[]
}

export type ActiviteDeMediationASupprimer = {
  readonly id: ActiviteId
  readonly type: TypeDActivite
  readonly mediateurId: MediateurId
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
}) => Promise<ActiviteDeMediationLue | null>

export type SupprimerLActiviteDeMediation = (
  suppression: SuppressionDeLActiviteDeMediation,
) => Promise<void>

export type SupprimerUneActiviteDeMediationPorts = {
  readonly activiteDuMediateur: ActiviteDeMediationDuMediateur
  readonly supprimer: SupprimerLActiviteDeMediation
}
