import type { CodePostal } from '@/libraries/code-postal'
import type { CodeInsee } from '@/libraries/insee'
import type { Telephone } from '@/libraries/telephone'
import type { Commune } from './commune'
import type { MediateurId } from './identifiants/mediateur-id'
import type { UtilisateurId } from './identifiants/utilisateur-id'
import type { Courriel } from './identite/courriel'
import type { Nom } from './identite/nom'
import type { Prenom } from './identite/prenom'
import type { NomStructure } from './nom-structure'
import type { RoleMembre } from './role-membre'
import type { StatutMembre } from './statut-membre'
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
  readonly email: Courriel
  readonly statut: StatutMembre
  readonly personne: PersonneDeLEquipe
  readonly structureEmployeuse: StructureEmployeuseMembre
}
