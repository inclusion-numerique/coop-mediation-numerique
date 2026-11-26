import type { CoordinateurId, MediateurId } from '../../../domain'

export type Detachement = {
  readonly mediateurId: MediateurId | null
  readonly coordinateurId: CoordinateurId | null
  readonly retireesLe: Date
}

export type BilanDuDetachement = {
  readonly invitationsSupprimees: number
  readonly appartenancesRetirees: number
}

export type DetachementEffectue = {
  readonly detachement: Detachement | null
  readonly bilan: BilanDuDetachement
}
