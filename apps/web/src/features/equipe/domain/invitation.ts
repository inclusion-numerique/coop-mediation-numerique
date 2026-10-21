import { failure, type Result, success } from '@app/web/libraries/result'
import { InvitationDejaTraitee } from './errors'
import type { MediateurId } from './mediateur-id'
import type { ReferenceInvitation } from './reference-invitation'

export type Invite =
  | { readonly type: 'SansCompte' }
  | { readonly type: 'MediateurInscrit'; readonly mediateurId: MediateurId }

type SocleInvitation = {
  readonly reference: ReferenceInvitation
  readonly invite: Invite
  readonly envoyeeLe: Date
  readonly renvoyeeLe: Date | null
}

export type InvitationEnAttente = SocleInvitation & {
  readonly statut: 'EnAttente'
}

export type InvitationAcceptee = SocleInvitation & {
  readonly statut: 'Acceptee'
  readonly accepteeLe: Date
}

export type InvitationRefusee = SocleInvitation & {
  readonly statut: 'Refusee'
  readonly refuseeLe: Date
}

export type Invitation =
  | InvitationEnAttente
  | InvitationAcceptee
  | InvitationRefusee

export const exigerEnAttente = (
  invitation: Invitation,
): Result<InvitationEnAttente, InvitationDejaTraitee> =>
  invitation.statut === 'EnAttente'
    ? success(invitation)
    : failure(InvitationDejaTraitee(invitation.reference, invitation.statut))
