import type { NomAffiche, UtilisateurId } from '@/features/utilisateurs/domain'
import { failure, type Result, success } from '@/libraries/result'
import {
  AucuneUsurpationEnCours,
  type EchecDeTerminerLUsurpation,
  UsurpateurNonAdministrateur,
} from './errors'

export type SessionCourante = {
  readonly jeton: string
  readonly usurpation:
    | { readonly _tag: 'Aucune' }
    | {
        readonly _tag: 'EnCours'
        readonly usurpateurId: UtilisateurId
        readonly usurpateurEstAdministrateur: boolean
      }
}

export type SessionRendue = {
  readonly jeton: string
  readonly usurpateurId: UtilisateurId
  readonly nom: NomAffiche
}

export const usurpateurARetrouver = ({
  usurpation,
}: SessionCourante): Result<UtilisateurId, EchecDeTerminerLUsurpation> => {
  if (usurpation._tag === 'Aucune') return failure(AucuneUsurpationEnCours())
  if (!usurpation.usurpateurEstAdministrateur)
    return failure(UsurpateurNonAdministrateur())
  return success(usurpation.usurpateurId)
}
