import type { AdresseCourriel } from './adresse-courriel'
import type { Prenom } from './prenom'
import type { RattachementsDuCompte } from './rattachements'
import type { ActionDeRelance } from './relance'
import type { UtilisateurId } from './utilisateur-id'

export type DestinataireDeRelance = {
  readonly utilisateurId: UtilisateurId
  readonly courriel: AdresseCourriel
  readonly prenom: Prenom | null
  readonly rattachements: RattachementsDuCompte
}

export type RapportDeRelance = {
  readonly utilisateurId: UtilisateurId
  readonly action: Exclude<ActionDeRelance['_tag'], 'Rien'>
} & (
  | { readonly issue: 'fait' }
  | { readonly issue: 'echec'; readonly cause: string }
)
