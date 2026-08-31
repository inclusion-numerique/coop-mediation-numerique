import type {
  RoleUtilisateur,
  UtilisateurId,
} from '@app/web/features/utilisateurs/domain'
import type { CauseTechnique } from './constat-effacement'

export type CompteIntrouvable = {
  readonly _tag: 'CompteIntrouvable'
  readonly utilisateurId: UtilisateurId
}

export type CompteDejaSupprime = {
  readonly _tag: 'CompteDejaSupprime'
  readonly utilisateurId: UtilisateurId
  readonly depuis: Date
}

export type RoleProtege = {
  readonly _tag: 'RoleProtege'
  readonly utilisateurId: UtilisateurId
  readonly role: RoleUtilisateur
}

/**
 * Le noyau transactionnel a échoué : ni sessions coupées, ni jetons révoqués,
 * ni identité effacée. Aucune charge satellite n'a été lancée, l'état est
 * inchangé — c'est le seul échec possible une fois le compte lu.
 */
export type AccesNonCoupe = {
  readonly _tag: 'AccesNonCoupe'
  readonly utilisateurId: UtilisateurId
  readonly cause: CauseTechnique
}

export type SupprimerCompteError =
  | CompteIntrouvable
  | CompteDejaSupprime
  | RoleProtege
  | AccesNonCoupe

export const CompteIntrouvable = (
  utilisateurId: UtilisateurId,
): CompteIntrouvable => ({ _tag: 'CompteIntrouvable', utilisateurId })

export const CompteDejaSupprime = (
  utilisateurId: UtilisateurId,
  depuis: Date,
): CompteDejaSupprime => ({ _tag: 'CompteDejaSupprime', utilisateurId, depuis })

export const RoleProtege = (
  utilisateurId: UtilisateurId,
  role: RoleUtilisateur,
): RoleProtege => ({ _tag: 'RoleProtege', utilisateurId, role })

export const AccesNonCoupe = (
  utilisateurId: UtilisateurId,
  cause: CauseTechnique,
): AccesNonCoupe => ({ _tag: 'AccesNonCoupe', utilisateurId, cause })
