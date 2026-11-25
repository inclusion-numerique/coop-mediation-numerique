import type {
  CoordinateurId,
  Courriel,
  NomAffiche,
  UtilisateurId,
} from '../../../domain'

export type MediateurAAjouter = {
  readonly utilisateurId: UtilisateurId
  readonly nom: NomAffiche
  readonly email: Courriel
}

export type EquipeAComplementer = {
  readonly coordinateurId: CoordinateurId
  readonly utilisateurId: UtilisateurId
  readonly nom: NomAffiche
}
