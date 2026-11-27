import {
  CoordinateurId,
  Courriel,
  type Invitation,
  type Invite,
  MediateurId,
  ReferenceInvitation,
} from '../../domain'

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

const toInvite = (mediateurId: string | null): Invite =>
  mediateurId === null
    ? { type: 'SansCompte' }
    : { type: 'MediateurInscrit', mediateurId: MediateurId(mediateurId) }

export const toInvitation = (row: InvitationRow): Invitation => {
  const socle = {
    reference: ReferenceInvitation({
      email: Courriel(row.email),
      coordinateurId: CoordinateurId(row.coordinateurId),
    }),
    invite: toInvite(row.mediateurId),
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
