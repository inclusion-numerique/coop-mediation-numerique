import { failure, type Result, success } from '@app/web/libraries/result'

export type SessionCourante = {
  readonly jeton: string
  readonly usurpation:
    | { readonly _tag: 'Aucune' }
    | {
        readonly _tag: 'EnCours'
        readonly usurpateurId: string
        readonly usurpateurEstAdministrateur: boolean
      }
}

export type AucuneUsurpationEnCours = {
  readonly _tag: 'AucuneUsurpationEnCours'
}

export type UsurpateurNonAdministrateur = {
  readonly _tag: 'UsurpateurNonAdministrateur'
}

export type TerminerLUsurpationError =
  | AucuneUsurpationEnCours
  | UsurpateurNonAdministrateur

export const usurpateurARetrouver = ({
  usurpation,
}: SessionCourante): Result<string, TerminerLUsurpationError> => {
  if (usurpation._tag === 'Aucune')
    return failure({ _tag: 'AucuneUsurpationEnCours' })
  if (!usurpation.usurpateurEstAdministrateur)
    return failure({ _tag: 'UsurpateurNonAdministrateur' })
  return success(usurpation.usurpateurId)
}
