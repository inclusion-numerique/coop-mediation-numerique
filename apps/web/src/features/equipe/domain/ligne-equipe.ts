import type { CodeInsee } from './code-insee'
import type { CodePostal } from './code-postal'
import type { Commune } from './commune'
import type { Email } from './email'
import type { MediateurId } from './mediateur-id'
import type { Nom } from './nom'
import type { NomStructure } from './nom-structure'
import type { Prenom } from './prenom'
import type { RoleMembre } from './role-membre'
import type { StatutMembre } from './statut-membre'
import type { Telephone } from './telephone'
import type { UtilisateurId } from './utilisateur-id'
import type { Voie } from './voie'

export type AdresseStructure =
  | { readonly type: 'Inconnue' }
  | {
      readonly type: 'Connue'
      readonly voie: Voie | null
      readonly commune: Commune
      readonly codePostal: CodePostal
      readonly codeInsee: CodeInsee
    }

export type StructureEmployeuseMembre =
  | { readonly type: 'Inconnue' }
  | {
      readonly type: 'Connue'
      readonly nom: NomStructure | null
      readonly adresse: AdresseStructure
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
