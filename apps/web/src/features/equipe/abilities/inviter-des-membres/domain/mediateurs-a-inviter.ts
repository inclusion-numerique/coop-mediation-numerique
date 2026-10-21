import type { EmailInvitation, MediateurId } from '../../../domain'

export type MediateurAInviter = {
  readonly mediateurId: MediateurId
  readonly nom: string
  readonly email: EmailInvitation
  readonly conseillerNumerique: boolean
}

export type MediateursAInviter = {
  readonly mediateurs: readonly MediateurAInviter[]
  readonly total: number
}
