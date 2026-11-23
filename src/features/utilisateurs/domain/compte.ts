import type { Dispositif } from './dispositif'
import type { UtilisateurId } from './identifiants/utilisateur-id'
import type { AdresseCourriel } from './identite/adresse-courriel'
import type { RattachementsDuCompte } from './rattachements'
import type { RoleUtilisateur } from './role-utilisateur'

export type EtatCompte =
  | { readonly _tag: 'actif' }
  | { readonly _tag: 'supprime'; readonly depuis: Date }

export type CompteASupprimer = {
  readonly id: UtilisateurId
  readonly courriel: AdresseCourriel
  readonly role: RoleUtilisateur
  readonly etat: EtatCompte
  readonly rattachements: RattachementsDuCompte
  readonly dispositif: Dispositif
}

export const etatDuCompte = (supprimeLe: Date | null): EtatCompte =>
  supprimeLe === null
    ? { _tag: 'actif' }
    : { _tag: 'supprime', depuis: supprimeLe }
