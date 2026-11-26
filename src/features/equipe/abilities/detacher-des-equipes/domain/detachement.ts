import type { CoordinateurId, MediateurId } from '../../../domain'

export type CompteRattache =
  | { readonly _tag: 'Mediateur'; readonly mediateurId: MediateurId }
  | { readonly _tag: 'Coordinateur'; readonly coordinateurId: CoordinateurId }
  | {
      readonly _tag: 'MediateurEtCoordinateur'
      readonly mediateurId: MediateurId
      readonly coordinateurId: CoordinateurId
    }

export type CompteADetacher = CompteRattache | { readonly _tag: 'SansEquipe' }

export const compteADetacher = ({
  mediateurId,
  coordinateurId,
}: {
  readonly mediateurId: MediateurId | null
  readonly coordinateurId: CoordinateurId | null
}): CompteADetacher => {
  if (mediateurId !== null && coordinateurId !== null)
    return { _tag: 'MediateurEtCoordinateur', mediateurId, coordinateurId }
  if (mediateurId !== null) return { _tag: 'Mediateur', mediateurId }
  if (coordinateurId !== null) return { _tag: 'Coordinateur', coordinateurId }
  return { _tag: 'SansEquipe' }
}

export type Detachement = {
  readonly compte: CompteRattache
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
