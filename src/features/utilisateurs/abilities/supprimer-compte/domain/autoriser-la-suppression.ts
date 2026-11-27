import {
  type CompteASupprimer,
  estRoleProtege,
  type IdentiteAnonyme,
  RoleProtege,
  type UtilisateurId,
} from '@/features/utilisateurs/domain'
import { failure, type Result, success } from '@/libraries/result'
import type { AuteurSuppression } from './auteur-suppression'
import type { EffacementReport } from './effacement-report'
import {
  CompteDejaSupprime,
  type EchecDeSupprimerCompte,
  SuppressionReserveeAuDispositif,
} from './errors'
import type { MotifSuppression } from './motif-suppression'

export type CompteSupprime = {
  readonly id: UtilisateurId
  readonly motif: MotifSuppression
  readonly supprimeLe: Date
  readonly identite: IdentiteAnonyme
  readonly dejaAnonymise: boolean
  readonly report: EffacementReport
}

export const autoriserSuppression = (
  compte: CompteASupprimer,
  auteur: AuteurSuppression,
): Result<CompteASupprimer, EchecDeSupprimerCompte> => {
  if (estRoleProtege(compte.role)) {
    return failure(RoleProtege(compte.id, compte.role))
  }

  if (compte.etat._tag === 'supprime' && auteur._tag === 'titulaire') {
    return failure(CompteDejaSupprime(compte.id, compte.etat.depuis))
  }

  if (
    auteur._tag === 'titulaire' &&
    compte.dispositif === 'ConseillerNumerique'
  ) {
    return failure(SuppressionReserveeAuDispositif(compte.id))
  }

  return success(compte)
}
