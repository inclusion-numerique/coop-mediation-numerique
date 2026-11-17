import {
  coordinateurDe,
  mediateurDe,
  type RattachementsDuCompte,
} from '@/features/utilisateurs/domain'
import { failure, type Result, success } from '@/libraries/result'

export type NonCoordinateur = { readonly _tag: 'NonCoordinateur' }

export type Activation = 'AActiver' | 'DejaActivee'

export const activationDe = (
  rattachements: RattachementsDuCompte,
): Result<Activation, NonCoordinateur> => {
  if (coordinateurDe(rattachements) === null)
    return failure({ _tag: 'NonCoordinateur' })
  return success(
    mediateurDe(rattachements) === null ? 'AActiver' : 'DejaActivee',
  )
}
