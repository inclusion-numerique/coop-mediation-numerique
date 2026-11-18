export const getUserRoleLabel = (user: {
  role: string
  isConseillerNumerique: boolean
  mediateur: { id: string } | null
  coordinateur: { id: string } | null
}) => {
  if (user.role === 'Admin') return 'Administrateur'
  if (user.coordinateur != null) return 'Coordinateur'
  if (user.isConseillerNumerique) return 'Conseiller Numérique'
  if (user.mediateur != null) return 'Médiateur'

  return 'Rôle non défini'
}

export type UserRoleLabel = ReturnType<typeof getUserRoleLabel>
