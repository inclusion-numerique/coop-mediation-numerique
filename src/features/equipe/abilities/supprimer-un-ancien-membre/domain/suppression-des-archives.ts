import type {
  AdhesionArchivee,
  CoordinateurId,
  MediateurId,
  UtilisateurId,
} from '../../../domain'

export type SuppressionDesArchives = {
  readonly adhesions: readonly AdhesionArchivee[]
  readonly mediateurId: MediateurId
  readonly coordinateurId: CoordinateurId
  readonly auteurId: UtilisateurId
}
