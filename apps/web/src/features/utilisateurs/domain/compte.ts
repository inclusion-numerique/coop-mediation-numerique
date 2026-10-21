import type { AdresseCourriel } from './adresse-courriel'
import type { RattachementsDuCompte } from './rattachements'
import type { RoleUtilisateur } from './role-utilisateur'
import type { UtilisateurId } from './utilisateur-id'

export type EtatCompte =
  | { readonly _tag: 'actif' }
  | { readonly _tag: 'supprime'; readonly depuis: Date }

export type CompteASupprimer = {
  readonly id: UtilisateurId
  readonly courriel: AdresseCourriel
  readonly role: RoleUtilisateur
  readonly etat: EtatCompte
  readonly rattachements: RattachementsDuCompte
}

export const etatDuCompte = (supprimeLe: Date | null): EtatCompte =>
  supprimeLe === null
    ? { _tag: 'actif' }
    : { _tag: 'supprime', depuis: supprimeLe }

export const estSupprime = (compte: CompteASupprimer): boolean =>
  compte.etat._tag === 'supprime'
