import type { EmailInvitation } from '../../../domain'
import type { Ecart } from './planifier'

export type InvitationsEnvoyees = {
  readonly envoyees: readonly EmailInvitation[]
  readonly ecartees: readonly Ecart[]
  readonly echecs: readonly EmailInvitation[]
}
