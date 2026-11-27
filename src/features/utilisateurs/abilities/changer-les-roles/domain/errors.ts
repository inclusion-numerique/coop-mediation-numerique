import type {
  EchecDuChangementDeRoles,
  UtilisateurIntrouvable,
} from '@/features/utilisateurs/domain'

export type AucunRoleDemande = { readonly _tag: 'AucunRoleDemande' }

export const AucunRoleDemande = (): AucunRoleDemande => ({
  _tag: 'AucunRoleDemande',
})

export type EchecDeChangerLesRoles =
  | UtilisateurIntrouvable
  | AucunRoleDemande
  | EchecDuChangementDeRoles
