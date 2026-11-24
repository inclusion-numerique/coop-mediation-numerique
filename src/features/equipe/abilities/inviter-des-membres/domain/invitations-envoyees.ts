import type { Courriel } from '../../../domain'
import type { Ecart } from './planifier'

export type InvitationsEnvoyees = {
  readonly envoyees: readonly Courriel[]
  readonly ecartees: readonly Ecart[]
  readonly echecs: readonly Courriel[]
}
