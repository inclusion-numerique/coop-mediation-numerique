import { getUserAccountStatus } from '@app/web/features/utilisateurs/use-cases/list/getUserAccountStatus'
import { UtilisateurForList } from '@app/web/features/utilisateurs/use-cases/list/queryUtilisateursForList'
import Badge from '@codegouvfr/react-dsfr/Badge'
import { ReactNode } from 'react'

export const getUserAccountStatusBadge = (
  user: UtilisateurForList,
): ReactNode => {
  const accountStatus = getUserAccountStatus(user)

  if (!accountStatus) return null

  if (accountStatus === 'Nouveau J-30') {
    return (
      <Badge small severity="info">
        Nouveau J-30
      </Badge>
    )
  }

  if (accountStatus === 'Actif J-30') {
    return (
      <Badge small severity="success">
        Actif J-30
      </Badge>
    )
  }

  if (accountStatus === 'Inactif J30+') {
    return (
      <Badge small severity="warning">
        Inactif J30+
      </Badge>
    )
  }

  if (accountStatus === 'Inactif J90+') {
    return (
      <Badge small severity="warning">
        Inactif J90+
      </Badge>
    )
  }

  return (
    <Badge small severity="error">
      Inactif J180+
    </Badge>
  )
}
