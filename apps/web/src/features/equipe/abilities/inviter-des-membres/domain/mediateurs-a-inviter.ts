import type { Email, MediateurId } from '../../../domain'

export type MediateurAInviter = {
  readonly mediateurId: MediateurId
  readonly nom: string
  readonly email: Email
  readonly conseillerNumerique: boolean
}

export type MediateursAInviter = {
  readonly mediateurs: readonly MediateurAInviter[]
  readonly total: number
}
