import { z } from 'zod'
import { defineModel, type Model } from '@/libraries/model'

const rolesProteges = ['Support', 'Admin'] as const

export const rolesUtilisateur = ['User', ...rolesProteges] as const

export const RoleUtilisateur = defineModel(
  z.enum(rolesUtilisateur).brand('RoleUtilisateur'),
)

export type RoleUtilisateur = Model.TypeOf<typeof RoleUtilisateur>

export const estRoleProtege = (role: RoleUtilisateur): boolean =>
  rolesProteges.some((protege) => protege === role)
