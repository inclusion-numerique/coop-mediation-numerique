import type {
  Prevenance,
  ReferenceInvitation,
  UtilisateurId,
} from '../../../domain'

export type Refus = {
  readonly reference: ReferenceInvitation
  readonly auteurId: UtilisateurId | null
  readonly refuseeLe: Date
}

export type RefusEnregistre = {
  readonly refus: Refus
  readonly prevenance: Prevenance | null
}
