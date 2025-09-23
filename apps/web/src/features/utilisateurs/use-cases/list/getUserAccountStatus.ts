import { UtilisateurForList } from '@app/web/features/utilisateurs/use-cases/list/queryUtilisateursForList'

const MILISECONDS = 1000 * 60 * 60 * 24

export const getUserAccountStatus = (
  user: UtilisateurForList,
): string | null => {
  if (
    user.deleted ||
    user.role === 'Admin' ||
    user.role === 'Support' ||
    !user.inscriptionValidee
  ) {
    return null
  }

  const now = new Date()
  const created = user.created
  const lastCra = user.mediateur?.activites[0]?.date

  const daysSinceCreation = (now.getTime() - created.getTime()) / MILISECONDS

  if (daysSinceCreation <= 30) return 'Nouveau J-30'

  if (!lastCra) return 'Inactif'

  const daysSinceLastCra = (now.getTime() - lastCra.getTime()) / MILISECONDS

  if (daysSinceLastCra <= 30) return 'Actif J-30'
  if (daysSinceLastCra <= 90) return 'Inactif J30+'
  if (daysSinceLastCra <= 180) return 'Inactif J90+'
  return 'Inactif J180+'
}
