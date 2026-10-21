import type { AdresseCourriel } from './adresse-courriel'
import type { UtilisateurId } from './utilisateur-id'

export type DestinataireDeRelance = {
  readonly utilisateurId: UtilisateurId
  readonly courriel: AdresseCourriel
  readonly prenom: string | null
  readonly estMediateur: boolean
  readonly estCoordinateur: boolean
}

export type RapportDeRelance = {
  readonly utilisateurId: UtilisateurId
  readonly action: 'Relancer' | 'Avertir' | 'Effacer' | 'Reinitialiser'
} & (
  | { readonly issue: 'fait' }
  | { readonly issue: 'echec'; readonly cause: string }
)
