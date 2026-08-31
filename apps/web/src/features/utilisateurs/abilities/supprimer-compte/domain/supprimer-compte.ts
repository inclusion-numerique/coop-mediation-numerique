import type {
  CompteASupprimer,
  UtilisateurId,
} from '@app/web/features/utilisateurs/domain'
import { estRoleProtege } from '@app/web/features/utilisateurs/domain'
import { failure, type Result, success } from '@app/web/libraries/result'
import type { AuteurSuppression } from './auteur-suppression'
import type { ConstatEffacement } from './constat-effacement'
import {
  CompteDejaSupprime,
  RoleProtege,
  type SupprimerCompteError,
} from './errors'
import type { MotifSuppression } from './motif-suppression'

export type CompteSupprime = {
  readonly id: UtilisateurId
  readonly motif: MotifSuppression
  readonly supprimeLe: Date
  readonly constat: ConstatEffacement
}

/**
 * La décision d'effacer, seule règle métier de l'ability.
 *
 * Deux refus, pour deux raisons différentes :
 *
 * Un rôle protégé n'est jamais effacé — se priver silencieusement d'un
 * administrateur ou d'un support est une panne d'exploitation. La garde ne
 * dépend pas de qui clique : elle vaut aussi quand l'administrateur supprime son
 * propre compte, ce que l'ancienne procédure autorisait sans le vouloir.
 *
 * Un compte déjà supprimé ne l'est pas deux fois pour son titulaire — il n'a
 * rien à y gagner et ne comprendrait pas. Un administrateur ou le couloir
 * automatique, eux, peuvent rejouer : c'est ce qui permet de rattraper les
 * comptes effacés par l'ancien code, dont les jetons sont toujours vivants.
 * L'empreinte étant déterministe, le rejeu ne heurte pas l'unicité du courriel.
 */
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

  return success(compte)
}
