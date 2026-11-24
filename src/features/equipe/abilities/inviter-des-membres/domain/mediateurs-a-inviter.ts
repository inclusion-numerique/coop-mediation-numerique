import type {
  Courriel,
  MediateurId,
  NomAffiche,
  RoleMembre,
} from '../../../domain'

export type MediateurAInviter = {
  readonly mediateurId: MediateurId
  readonly nom: NomAffiche
  readonly email: Courriel
  readonly role: RoleMembre
}

export type MediateursAInviter = {
  readonly mediateurs: readonly MediateurAInviter[]
  readonly total: number
}
