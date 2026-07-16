import type { Role } from '@app/web/features/inscription/domain'

/** Comptes de rôle à garantir selon le rôle choisi. */
export type RolesACreer = {
  readonly mediateur: boolean
  readonly coordinateur: boolean
}

/**
 * Règle métier pure : un rôle médiateur garantit un compte médiateur, un rôle
 * coordinateur un compte coordinateur. Le statut conseiller numérique n'entre
 * pas ici — il retombe sur son rôle de base pour les comptes (un CN médiateur a
 * un compte médiateur). Aucun rôle ne rend les deux `false` : c'est ce qui
 * autorise `valider` à ne pas revérifier l'existence d'un compte de rôle.
 */
export const rolesACreerPourRole = (role: Role): RolesACreer => ({
  mediateur: role === 'Mediateur',
  coordinateur: role === 'Coordinateur',
})
