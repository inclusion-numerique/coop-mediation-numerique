import type { UtilisateurId } from '../identifiants/utilisateur-id'
import type { AdresseCourriel } from '../identite/adresse-courriel'
import type { Prenom } from '../identite/prenom'
import type { RattachementsDuCompte } from '../rattachements'
import type { ActionDeRelance } from './relance'

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
