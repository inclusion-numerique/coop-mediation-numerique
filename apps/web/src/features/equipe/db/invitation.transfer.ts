import {
  CoordinateurId,
  EmailInvitation,
  type Invitation,
  type Invite,
  MediateurId,
  ReferenceInvitation,
} from '../domain'

export const invitationSelect = {
  email: true,
  coordinateurId: true,
  mediateurId: true,
  creation: true,
  acceptee: true,
  refusee: true,
  renvoyee: true,
} as const

export type InvitationRow = {
  readonly email: string
  readonly coordinateurId: string
  readonly mediateurId: string | null
  readonly creation: Date
  readonly acceptee: Date | null
  readonly refusee: Date | null
  readonly renvoyee: Date | null
}

const toInvite = (
  email: EmailInvitation,
  mediateurId: string | null,
): Invite | null => {
  if (mediateurId == null) return { type: 'SansCompte', email }
  const id = MediateurId.safe(mediateurId)
  return id === null
    ? null
    : { type: 'MediateurInscrit', email, mediateurId: id }
}

export const toInvitation = (row: InvitationRow): Invitation | null => {
  const email = EmailInvitation.safe(row.email)
  const coordinateurId = CoordinateurId.safe(row.coordinateurId)
  if (email === null || coordinateurId === null) return null

  const invite = toInvite(email, row.mediateurId)
  if (invite === null) return null

  const socle = {
    reference: ReferenceInvitation({ email, coordinateurId }),
    invite,
    envoyeeLe: row.creation,
    renvoyeeLe: row.renvoyee,
  }

  if (row.acceptee != null)
    return { ...socle, statut: 'Acceptee', accepteeLe: row.acceptee }
  if (row.refusee != null)
    return { ...socle, statut: 'Refusee', refuseeLe: row.refusee }
  return { ...socle, statut: 'EnAttente' }
}

export const fromInvitation = (invitation: Invitation): InvitationRow => ({
  email: invitation.reference.email,
  coordinateurId: invitation.reference.coordinateurId,
  mediateurId:
    invitation.invite.type === 'MediateurInscrit'
      ? invitation.invite.mediateurId
      : null,
  creation: invitation.envoyeeLe,
  acceptee: invitation.statut === 'Acceptee' ? invitation.accepteeLe : null,
  refusee: invitation.statut === 'Refusee' ? invitation.refuseeLe : null,
  renvoyee: invitation.renvoyeeLe,
})
