import { dateAsDayAndTime } from '@app/web/utils/dateAsDayAndTime'
import Badge from '@codegouvfr/react-dsfr/Badge'
import { ReactNode } from 'react'

type InvitationStatusInput = {
  acceptee: Date | null
  refusee: Date | null
}

export const getInvitationStatusBadge = (
  invitation: InvitationStatusInput,
): ReactNode => {
  if (invitation.acceptee) {
    return (
      <Badge small severity="success">
        Acceptée le {dateAsDayAndTime(invitation.acceptee)}
      </Badge>
    )
  }

  if (invitation.refusee) {
    return (
      <Badge small severity="error">
        Refusée le {dateAsDayAndTime(invitation.refusee)}
      </Badge>
    )
  }

  return (
    <Badge small severity="info">
      En attente
    </Badge>
  )
}
