import {
  type ContactAImporter,
  type CoordinateurId,
  coordinateurDe,
  mediateurDe,
  type RattachementsDuCompte,
  type UtilisateurId,
} from '@/features/utilisateurs/domain'
import { failure, type Result, success } from '@/libraries/result'
import { NonCoordinateur } from './errors'

export type Activation =
  | { readonly _tag: 'DejaActivee' }
  | {
      readonly _tag: 'Activee'
      readonly utilisateurId: UtilisateurId
      readonly coordinateurId: CoordinateurId
      readonly inscription: ContactAImporter | null
    }

type DecisionDActivation =
  | { readonly _tag: 'DejaActivee' }
  | { readonly _tag: 'AActiver'; readonly coordinateurId: CoordinateurId }

export const activationDe = (
  rattachements: RattachementsDuCompte,
): Result<DecisionDActivation, NonCoordinateur> => {
  const coordinateurId = coordinateurDe(rattachements)
  if (coordinateurId === null) return failure(NonCoordinateur())
  return success(
    mediateurDe(rattachements) === null
      ? { _tag: 'AActiver', coordinateurId }
      : { _tag: 'DejaActivee' },
  )
}
