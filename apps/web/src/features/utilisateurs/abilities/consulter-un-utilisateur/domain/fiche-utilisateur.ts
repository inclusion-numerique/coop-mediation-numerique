import type {
  AdresseCourriel,
  Dispositif,
  Jalon,
  Rattachements,
  RoleUtilisateur,
  StatutCompte,
  UtilisateurId,
} from '@app/web/features/utilisateurs/domain'

export type CoordinationDuMediateur = {
  readonly coordinateurUtilisateurId: UtilisateurId
  readonly nom: string | null
}

export type MediateurDeLaFiche = {
  readonly id: string
  readonly creeLe: Date
  readonly modifieLe: Date
  readonly beneficiaires: number
  readonly activites: number
  readonly lieuxActivite: number
  readonly visible: boolean
  readonly retirable: boolean
  readonly coordinations: readonly CoordinationDuMediateur[]
}

export type CoordinateurDeLaFiche = {
  readonly id: string
  readonly creeLe: Date
  readonly modifieLe: Date
  readonly mediateursCoordonnes: number
  readonly retirable: boolean
}

export type LiaisonDeLaFiche = {
  readonly fournisseur: string
  readonly identifiant: string
}

export type Evenement = {
  readonly libelle: string
  readonly le: Date
}

export type FicheUtilisateur = {
  readonly id: UtilisateurId
  readonly nomAffiche: string
  readonly prenom: string | null
  readonly nom: string | null
  readonly courriel: AdresseCourriel
  readonly telephone: string | null
  readonly role: RoleUtilisateur
  readonly dispositif: Dispositif
  readonly siret: string | null
  readonly creeLe: Date
  readonly inscritLe: Date | null
  readonly supprimeLe: Date | null
  readonly profilInscription: string | null
  readonly derniereConnexion: Jalon
  readonly derniereVisite: Jalon
  readonly statut: StatutCompte
  readonly rattachements: Rattachements<
    MediateurDeLaFiche,
    CoordinateurDeLaFiche
  >
  readonly liaisons: readonly LiaisonDeLaFiche[]
  readonly sessions: readonly Evenement[]
  readonly mutations: readonly Evenement[]
  readonly fichiers: readonly Evenement[]
}
