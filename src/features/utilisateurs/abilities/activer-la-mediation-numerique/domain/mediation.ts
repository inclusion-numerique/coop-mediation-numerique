import {
  type CoordinateurId,
  coordinateurDe,
  mediateurDe,
  type RattachementsDuCompte,
} from '@/features/utilisateurs/domain'
import { failure, type Result, success } from '@/libraries/result'

export type NonCoordinateur = { readonly _tag: 'NonCoordinateur' }

export type Activation = 'AActiver' | 'DejaActivee'

type DecisionDActivation =
  | { readonly _tag: 'DejaActivee' }
  | { readonly _tag: 'AActiver'; readonly coordinateurId: CoordinateurId }

export const activationDe = (
  rattachements: RattachementsDuCompte,
): Result<DecisionDActivation, NonCoordinateur> => {
  const coordinateurId = coordinateurDe(rattachements)
  if (coordinateurId === null) return failure({ _tag: 'NonCoordinateur' })
  return success(
    mediateurDe(rattachements) === null
      ? { _tag: 'AActiver', coordinateurId }
      : { _tag: 'DejaActivee' },
  )
}
