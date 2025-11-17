import { UtilisateurForList } from '@app/web/features/utilisateurs/use-cases/list/queryUtilisateursForList'

const MILISECONDS_PER_DAY = 1000 * 60 * 60 * 24

export type UserAccountStatusInput = Pick<
  UtilisateurForList,
  'deleted' | 'role' | 'inscriptionValidee' | 'created'
> & {
  mediateur: Pick<
    NonNullable<UtilisateurForList['mediateur']>,
    'derniereCreationActivite' | 'derniereCreationBeneficiaire'
  > | null
}

export const getUserAccountStatus = (
  user: UserAccountStatusInput,
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
  const lastCra = user.mediateur?.derniereCreationActivite
  const lastBeneficiaire = user.mediateur?.derniereCreationBeneficiaire

  const lastActionTimestamp =
    lastCra && lastBeneficiaire
      ? Math.max(lastCra.getTime(), lastBeneficiaire.getTime())
      : (lastCra?.getTime() ?? lastBeneficiaire?.getTime())

  const daysSinceCreation =
    (now.getTime() - created.getTime()) / MILISECONDS_PER_DAY

  if (daysSinceCreation <= 30) return 'Nouveau J-30'

  if (!lastActionTimestamp) return 'Inactif'

  const daysSinceLastAction =
    (now.getTime() - lastActionTimestamp) / MILISECONDS_PER_DAY

  if (daysSinceLastAction <= 30) return 'Actif J-30'
  if (daysSinceLastAction <= 90) return 'Inactif J30+'
  if (daysSinceLastAction <= 180) return 'Inactif J90+'

  return 'Inactif J180+'
}
