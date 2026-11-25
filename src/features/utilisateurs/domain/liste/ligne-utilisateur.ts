import type { CodeInsee } from '@/libraries/insee'
import type { Dispositif } from '../dispositif'
import type { UtilisateurId } from '../identifiants/utilisateur-id'
import type { AdresseCourriel } from '../identite/adresse-courriel'
import type { Nom } from '../identite/nom'
import type { NomAffiche } from '../identite/nom-affiche'
import type { Prenom } from '../identite/prenom'
import type { NomEmployeuse } from '../nom-employeuse'
import type { Rattachements } from '../rattachements'
import type { Jalon } from '../relances/jalon'
import type { RoleUtilisateur } from '../role-utilisateur'
import type { StatutCompte } from '../statut-compte'

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
  readonly nom: NomEmployeuse | null
  readonly codeInsee: CodeInsee | null
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
