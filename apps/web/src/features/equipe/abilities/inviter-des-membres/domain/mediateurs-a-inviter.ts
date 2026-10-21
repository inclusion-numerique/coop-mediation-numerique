import type {
  Email,
  MediateurId,
  NomAffiche,
  RoleMembre,
} from '../../../domain'

export type MediateurAInviter = {
  readonly mediateurId: MediateurId
  readonly nom: NomAffiche
  readonly email: Email
  readonly role: RoleMembre
}

export type MediateursAInviter = {
  readonly mediateurs: readonly MediateurAInviter[]
  readonly total: number
}
