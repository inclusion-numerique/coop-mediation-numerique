import type {
  CompteSupprime,
  RoleUtilisateur,
  UtilisateurId,
  UtilisateurIntrouvable,
} from '@app/web/features/utilisateurs/domain'

export type AucunRoleDemande = { readonly _tag: 'AucunRoleDemande' }

export const AucunRoleDemande = (): AucunRoleDemande => ({
  _tag: 'AucunRoleDemande',
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

export type ChangerLesRolesError =
  | UtilisateurIntrouvable
  | CompteSupprime
  | AucunRoleDemande
  | RoleProtege
  | RoleNonVierge
