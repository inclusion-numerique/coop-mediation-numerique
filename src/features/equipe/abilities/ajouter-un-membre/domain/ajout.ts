import type {
  CoordinateurId,
  Courriel,
  MediateurId,
  UtilisateurId,
} from '../../../domain'

export type UtilisateurAAjouter =
  | {
      readonly type: 'Mediateur'
      readonly mediateurId: MediateurId
      readonly email: Courriel
    }
  | { readonly type: 'NonMediateur' }

export type Ajout = {
  readonly mediateurId: MediateurId
  readonly coordinateurId: CoordinateurId
  readonly email: Courriel
  readonly auteurId: UtilisateurId
}
