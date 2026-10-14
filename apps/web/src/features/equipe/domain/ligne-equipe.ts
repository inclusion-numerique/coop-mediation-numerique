import type { MediateurId } from './mediateur-id'
import type { StatutMembre } from './statut-membre'
import type { UtilisateurId } from './utilisateur-id'

export type RoleMembre = 'ConseillerNumerique' | 'MediateurNumerique'

export type StructureEmployeuseMembre =
  | { readonly type: 'Inconnue' }
  | {
      readonly type: 'Connue'
      readonly nom: string | null
      readonly adresse: string | null
      readonly commune: string | null
      readonly codePostal: string | null
      readonly codeInsee: string | null
    }

export type ProfilMembre = {
  readonly utilisateurId: UtilisateurId
  readonly prenom: string | null
  readonly nom: string | null
  readonly telephone: string | null
  readonly role: RoleMembre
}

export type LigneEquipe = {
  readonly email: string
  readonly statut: StatutMembre
  readonly mediateurId: MediateurId | null
  readonly profil: ProfilMembre | null
  readonly structureEmployeuse: StructureEmployeuseMembre
}
