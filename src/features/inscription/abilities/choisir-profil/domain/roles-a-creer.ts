import type { Role } from '@/features/inscription/domain'

export type RolesACreer = {
  readonly mediateur: boolean
  readonly coordinateur: boolean
}

export const rolesACreerPourRole = (role: Role): RolesACreer => ({
  mediateur: role === 'Mediateur',
  coordinateur: role === 'Coordinateur',
})
