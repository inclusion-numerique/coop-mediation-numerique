import type { Email } from '../../../domain'
import type { Ecart } from './planifier'

export type InvitationsEnvoyees = {
  readonly envoyees: readonly Email[]
  readonly ecartees: readonly Ecart[]
  readonly echecs: readonly Email[]
}
