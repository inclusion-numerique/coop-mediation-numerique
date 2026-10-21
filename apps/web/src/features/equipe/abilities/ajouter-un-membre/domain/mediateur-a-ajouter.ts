import type { Email, NomAffiche, UtilisateurId } from '../../../domain'

export type MediateurAAjouter = {
  readonly utilisateurId: UtilisateurId
  readonly nom: NomAffiche
  readonly email: Email
}

export type EquipeAComplementer = {
  readonly coordinateurId: string
  readonly utilisateurId: string
  readonly nom: string
}
