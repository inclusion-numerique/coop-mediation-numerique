import type { EchecTechnique } from '@/libraries/result'
import type { UtilisateurId } from './identifiants/utilisateur-id'
import type { RoleUtilisateur } from './role-utilisateur'

export type UtilisateurIntrouvable = {
  readonly _tag: 'UtilisateurIntrouvable'
}

export const UtilisateurIntrouvable = (): UtilisateurIntrouvable => ({
  _tag: 'UtilisateurIntrouvable',
})

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

export type RoleNonVierge = {
  readonly _tag: 'RoleNonVierge'
  readonly role: 'Mediateur' | 'Coordinateur'
}

export const RoleNonVierge = (role: RoleNonVierge['role']): RoleNonVierge => ({
  _tag: 'RoleNonVierge',
  role,
})

export type EchecDuChangementDeRoles =
  | CompteSupprime
  | RoleProtege
  | RoleNonVierge

export type EffacementRefuse = {
  readonly _tag: 'EffacementRefuse'
  readonly motif: string
}

export const EffacementRefuse = (motif: string): EffacementRefuse => ({
  _tag: 'EffacementRefuse',
  motif,
})

export type SuppressionRefusee = {
  readonly _tag: 'SuppressionRefusee'
  readonly motif: string
}

export const SuppressionRefusee = (motif: string): SuppressionRefusee => ({
  _tag: 'SuppressionRefusee',
  motif,
})

export type EchecDeRelance = EchecTechnique | EffacementRefuse

export type SourceIntrouvable = { readonly _tag: 'SourceIntrouvable' }

export const SourceIntrouvable = (): SourceIntrouvable => ({
  _tag: 'SourceIntrouvable',
})

export type CibleIntrouvable = { readonly _tag: 'CibleIntrouvable' }

export const CibleIntrouvable = (): CibleIntrouvable => ({
  _tag: 'CibleIntrouvable',
})
