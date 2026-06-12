import type { UserRole } from '@prisma/client'

// Pendant une maintenance, seuls les médiateurs/coordinateurs (role `User`) sont bloqués.
// Les administrateurs et le support conservent leur accès en écriture.
export const canMutateDuringMaintenance = ({
  role,
  active,
}: {
  role: UserRole
  active: boolean
}): boolean => !active || role !== 'User'
