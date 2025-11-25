import Badge from '@codegouvfr/react-dsfr/Badge'
import { ReactNode } from 'react'

export const getUserAccountStatusBadge = (status: string): ReactNode => {
  if (status.includes('J+90') || status.includes('J+180')) {
    return (
      <Badge small severity="error">
        {status}
      </Badge>
    )
  }

  if (status.includes('J+30') || status.includes('J+60')) {
    return (
      <Badge small severity="warning">
        {status}
      </Badge>
    )
  }

  if (status.includes('Inscription en cours')) {
    return (
      <Badge small severity="new">
        {status}
      </Badge>
    )
  }

  if (status.includes('Nouveau')) {
    return (
      <Badge small severity="info">
        {status}
      </Badge>
    )
  }

  return (
    <Badge small severity="success">
      {status}
    </Badge>
  )
}
