import type {
  CompteASupprimer,
  UtilisateurId,
} from '@app/web/features/utilisateurs/domain'
import { estRoleProtege } from '@app/web/features/utilisateurs/domain'
import { failure, type Result, success } from '@app/web/libraries/result'
import type { AuteurSuppression } from './auteur-suppression'
import type { EffacementReport } from './effacement-report'
import {
  CompteDejaSupprime,
  RoleProtege,
  SuppressionReserveeAuDispositif,
  type SupprimerCompteError,
} from './errors'
import type { MotifSuppression } from './motif-suppression'

export type CompteSupprime = {
  readonly id: UtilisateurId
  readonly motif: MotifSuppression
  readonly supprimeLe: Date
  readonly report: EffacementReport
}

export const autoriserSuppression = (
  compte: CompteASupprimer,
  auteur: AuteurSuppression,
): Result<CompteASupprimer, SupprimerCompteError> => {
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
