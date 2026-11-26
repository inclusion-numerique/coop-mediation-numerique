import type {
  EnvoiDInvitation,
  ReferenceInvitation,
  UtilisateurId,
} from '../../../domain'

export type Relance = {
  readonly reference: ReferenceInvitation
  readonly auteurId: UtilisateurId
  readonly renvoyeeLe: Date
}

export type RelanceEnvoyee = {
  readonly envoi: EnvoiDInvitation
  readonly relance: Relance
}
