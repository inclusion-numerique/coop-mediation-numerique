import type { MediateurId } from '../../../domain'

export type MediateurAInviter = {
  readonly mediateurId: MediateurId
  readonly nom: string
  readonly email: string
  readonly conseillerNumerique: boolean
}

export type MediateursAInviter = {
  readonly mediateurs: readonly MediateurAInviter[]
  readonly total: number
}
