import type { AdresseCourriel } from './adresse-courriel'
import type { Dispositif } from './dispositif'
import type { Jalon } from './jalon'
import type { Nom } from './nom'
import type { NomAffiche } from './nom-affiche'
import type { Prenom } from './prenom'
import type { Rattachements } from './rattachements'
import type { RoleUtilisateur } from './role-utilisateur'
import type { StatutCompte } from './statut-compte'
import type { UtilisateurId } from './utilisateur-id'

export type MediateurDeLaLigne = {
  readonly derniereActivite: Jalon
  readonly dernierBeneficiaire: Jalon
  readonly accompagnements: number
  readonly beneficiaires: number
  readonly lieuxActivite: number
}

export type CoordinateurDeLaLigne = {
  readonly aCoordonne: boolean
  readonly mediateursCoordonnes: number
}

export type EmployeuseDeLaLigne = {
  readonly nom: string | null
  readonly codeInsee: string | null
}

export type LigneUtilisateur = {
  readonly id: UtilisateurId
  readonly nomAffiche: NomAffiche
  readonly prenom: Prenom | null
  readonly nom: Nom | null
  readonly courriel: AdresseCourriel
  readonly role: RoleUtilisateur
  readonly creeLe: Date
  readonly derniereConnexion: Jalon
  readonly derniereVisite: Jalon
  readonly statut: StatutCompte
  readonly rattachements: Rattachements<
    MediateurDeLaLigne,
    CoordinateurDeLaLigne
  >
  readonly dispositif: Dispositif
  readonly employeuse: EmployeuseDeLaLigne | null
}
