import type { EchecTechnique } from '@/libraries/result'
import type { UtilisateurId } from './identifiants/utilisateur-id'
import type { RoleUtilisateur } from './role-utilisateur'

export type UtilisateurIntrouvable = {
  readonly _tag: 'UtilisateurIntrouvable'
  readonly utilisateurId: string
}

export const UtilisateurIntrouvable = (
  utilisateurId: string,
): UtilisateurIntrouvable => ({ _tag: 'UtilisateurIntrouvable', utilisateurId })

export type CompteSupprime = {
  readonly _tag: 'CompteSupprime'
  readonly utilisateurId: UtilisateurId
}

export const CompteSupprime = (
  utilisateurId: UtilisateurId,
): CompteSupprime => ({
  _tag: 'CompteSupprime',
  utilisateurId,
})

export type RoleProtege = {
  readonly _tag: 'RoleProtege'
  readonly utilisateurId: UtilisateurId
  readonly role: RoleUtilisateur
}

export const RoleProtege = (
  utilisateurId: UtilisateurId,
  role: RoleUtilisateur,
): RoleProtege => ({ _tag: 'RoleProtege', utilisateurId, role })

export type EffacementRefuse = {
  readonly _tag: 'EffacementRefuse'
  readonly motif: string
}

export const EffacementRefuse = (motif: string): EffacementRefuse => ({
  _tag: 'EffacementRefuse',
  motif,
})

export type EchecDeRelance = EchecTechnique | EffacementRefuse
