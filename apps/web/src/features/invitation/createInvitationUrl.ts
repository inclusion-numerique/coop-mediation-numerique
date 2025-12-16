import { encodeSerializableState } from '@app/web/utils/encodeSerializableState'

export const createInvitationUrl = ({
  email,
  coordinateurId,
}: {
  email: string
  coordinateurId: string
}) => {
  return `/invitations/${encodeSerializableState({ email, coordinateurId })}`
}
