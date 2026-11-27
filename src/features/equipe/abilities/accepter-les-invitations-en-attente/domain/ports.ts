import type { Courriel, Invitation, UtilisateurId } from '../../../domain'
import type {
  InvitationsAcceptees,
  MediateurInvite,
} from './acceptations-en-attente'

type MediateurInviteLu = Omit<MediateurInvite, 'email'> & {
  readonly email: Courriel | null
}

export type LireLeMediateurInvite = (
  utilisateurId: UtilisateurId,
) => Promise<MediateurInviteLu | null>

export type LireLesInvitationsDe = (
  email: Courriel,
) => Promise<readonly Invitation[]>

export type EnregistrerLesAcceptations = (
  acceptations: InvitationsAcceptees,
) => Promise<void>

export type AccepterLesInvitationsEnAttentePorts = {
  readonly lireLeMediateurInvite: LireLeMediateurInvite
  readonly lireLesInvitationsDe: LireLesInvitationsDe
  readonly enregistrerLesAcceptations: EnregistrerLesAcceptations
}
