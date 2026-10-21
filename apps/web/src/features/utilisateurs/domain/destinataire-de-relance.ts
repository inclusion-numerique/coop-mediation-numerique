import type { AdresseCourriel } from './adresse-courriel'
import type { Prenom } from './prenom'
import type { ActionDeRelance } from './relance'
import type { UtilisateurId } from './utilisateur-id'

export type DestinataireDeRelance = {
  readonly utilisateurId: UtilisateurId
  readonly courriel: AdresseCourriel
  readonly prenom: Prenom | null
  readonly estMediateur: boolean
  readonly estCoordinateur: boolean
}

export type RapportDeRelance = {
  readonly utilisateurId: UtilisateurId
  readonly action: Exclude<ActionDeRelance['_tag'], 'Rien'>
} & (
  | { readonly issue: 'fait' }
  | { readonly issue: 'echec'; readonly cause: string }
)
