import type { Email } from './email'
import type { MediateurId } from './mediateur-id'
import type { Nom } from './nom'
import type { Prenom } from './prenom'
import type { RoleMembre } from './role-membre'
import type { StatutMembre } from './statut-membre'
import type { Telephone } from './telephone'
import type { UtilisateurId } from './utilisateur-id'

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
  readonly prenom: Prenom | null
  readonly nom: Nom | null
  readonly telephone: Telephone | null
  readonly role: RoleMembre
}

export type PersonneDeLEquipe =
  | { readonly type: 'SansCompte' }
  | {
      readonly type: 'Inscrite'
      readonly mediateurId: MediateurId
      readonly profil: ProfilMembre
    }

export const profilDe = ({ personne }: LigneEquipe): ProfilMembre | null =>
  personne.type === 'Inscrite' ? personne.profil : null

export type LigneEquipe = {
  readonly email: Email
  readonly statut: StatutMembre
  readonly personne: PersonneDeLEquipe
  readonly structureEmployeuse: StructureEmployeuseMembre
}
