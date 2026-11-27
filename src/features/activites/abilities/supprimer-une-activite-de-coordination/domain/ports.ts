import type {
  ActiviteDeCoordinationId,
  CoordinateurId,
  TypeDActiviteDeCoordination,
} from '../../../domain'

export type ActiviteDeCoordinationASupprimer = {
  readonly id: ActiviteDeCoordinationId
  readonly type: TypeDActiviteDeCoordination
  readonly coordinateurId: CoordinateurId
}

export type SuppressionDeLActiviteDeCoordination = {
  readonly activite: ActiviteDeCoordinationASupprimer
  readonly suppression: Date
}

export type ActiviteDeCoordinationEnregistree = (
  id: ActiviteDeCoordinationId,
) => Promise<ActiviteDeCoordinationASupprimer | null>

export type SupprimerLActiviteDeCoordination = (
  suppression: SuppressionDeLActiviteDeCoordination,
) => Promise<void>

export type SupprimerUneActiviteDeCoordinationPorts = {
  readonly activiteEnregistree: ActiviteDeCoordinationEnregistree
  readonly supprimer: SupprimerLActiviteDeCoordination
}
