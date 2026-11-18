import type {
  CoordinateurId,
  Email,
  NomAffiche,
  UtilisateurId,
} from '../../../domain'

export type MediateurAAjouter = {
  readonly utilisateurId: UtilisateurId
  readonly nom: NomAffiche
  readonly email: Email
}

export type EquipeAComplementer = {
  readonly coordinateurId: CoordinateurId
  readonly utilisateurId: UtilisateurId
  readonly nom: NomAffiche
}
