import type {
  CompteSupprime,
  RoleProtege,
  UtilisateurIntrouvable,
} from '@/features/utilisateurs/domain'

export type AucunRoleDemande = { readonly _tag: 'AucunRoleDemande' }

export const AucunRoleDemande = (): AucunRoleDemande => ({
  _tag: 'AucunRoleDemande',
})

export type RoleNonVierge = {
  readonly _tag: 'RoleNonVierge'
  readonly role: 'Mediateur' | 'Coordinateur'
}

export const RoleNonVierge = (role: RoleNonVierge['role']): RoleNonVierge => ({
  _tag: 'RoleNonVierge',
  role,
})

export type EchecDeChangerLesRoles =
  | UtilisateurIntrouvable
  | CompteSupprime
  | AucunRoleDemande
  | RoleProtege
  | RoleNonVierge
