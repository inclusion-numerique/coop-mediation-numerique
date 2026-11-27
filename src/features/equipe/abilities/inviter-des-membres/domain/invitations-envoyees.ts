import type {
  CoordinateurId,
  Courriel,
  InvitationEnAttente,
  NomAffiche,
  UtilisateurId,
} from '../../../domain'
import type { Ecart } from './ecart'

export type InvitationsEnvoyees = {
  readonly envoyees: readonly Courriel[]
  readonly ecartees: readonly Ecart[]
  readonly echecs: readonly Courriel[]
}

export type EnregistrementDesInvitations = {
  readonly invitations: readonly InvitationEnAttente[]
  readonly coordinateurId: CoordinateurId
  readonly auteurId: UtilisateurId
}

export type InvitationsDecidees = InvitationsEnvoyees & {
  readonly enregistrement: EnregistrementDesInvitations
  readonly de: NomAffiche
}
