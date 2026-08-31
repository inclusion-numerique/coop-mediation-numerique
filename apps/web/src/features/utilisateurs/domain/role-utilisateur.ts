import { defineModel, type Model } from '@app/web/libraries/model'
import { z } from 'zod'

export const rolesUtilisateur = ['User', 'Support', 'Admin'] as const

/**
 * Rôle d'un compte. Non nullable en base (`@default(User)`), donc pas de valeur
 * d'absence à mapper.
 */
export const RoleUtilisateur = defineModel(
  z.enum(rolesUtilisateur).brand('RoleUtilisateur'),
)

export type RoleUtilisateur = Model.TypeOf<typeof RoleUtilisateur>

/**
 * Les rôles qu'on refuse d'effacer : se priver silencieusement d'un
 * administrateur ou d'un support est une panne d'exploitation, pas une
 * suppression de compte. La règle ne dépend pas de qui clique — elle vaut aussi
 * pour l'auto-suppression.
 */
export const estRoleProtege = (role: RoleUtilisateur): boolean =>
  role === 'Admin' || role === 'Support'
