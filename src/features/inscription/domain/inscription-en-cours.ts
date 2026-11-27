export type RoleDuCompte = 'User' | 'Admin'

export const inscriptionEnCours = (user?: {
  role: RoleDuCompte
  inscriptionValidee: string | Date | null
}) => {
  if (!user) {
    return false
  }
  const { role, inscriptionValidee } = user

  return !inscriptionValidee && role !== 'Admin'
}
