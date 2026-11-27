import type { RoleProtege, UtilisateurId } from '@/features/utilisateurs/domain'
import type { FailureReason } from './effacement-report'

export type CompteIntrouvable = {
  readonly _tag: 'CompteIntrouvable'
}

export type CompteDejaSupprime = {
  readonly _tag: 'CompteDejaSupprime'
  readonly utilisateurId: UtilisateurId
  readonly depuis: Date
}

export type AccesNonCoupe = {
  readonly _tag: 'AccesNonCoupe'
  readonly utilisateurId: UtilisateurId
  readonly cause: FailureReason
}

export type SuppressionReserveeAuDispositif = {
  readonly _tag: 'SuppressionReserveeAuDispositif'
  readonly utilisateurId: UtilisateurId
}

export type EchecDeSupprimerCompte =
  | CompteIntrouvable
  | CompteDejaSupprime
  | RoleProtege
  | SuppressionReserveeAuDispositif
  | AccesNonCoupe

export const CompteIntrouvable = (): CompteIntrouvable => ({
  _tag: 'CompteIntrouvable',
})

export const CompteDejaSupprime = (
  utilisateurId: UtilisateurId,
  depuis: Date,
): CompteDejaSupprime => ({ _tag: 'CompteDejaSupprime', utilisateurId, depuis })

export const SuppressionReserveeAuDispositif = (
  utilisateurId: UtilisateurId,
): SuppressionReserveeAuDispositif => ({
  _tag: 'SuppressionReserveeAuDispositif',
  utilisateurId,
})

export const AccesNonCoupe = (
  utilisateurId: UtilisateurId,
  cause: FailureReason,
): AccesNonCoupe => ({ _tag: 'AccesNonCoupe', utilisateurId, cause })
