import {
  franchirStructureEmployeuse,
  InscriptionDejaValidee,
  type InscriptionEnCours,
  type InscriptionEtat,
  InscriptionIntrouvable,
  isNonDemarree,
  isValidee,
  ProfilNonChoisi,
  type UserId,
} from '@app/web/features/inscription/domain'
import { failure, type Result, success } from '@app/web/libraries/result'
import type { EmployeuseIndisponible } from './errors'

export type RenseignerStructureEmployeuseError =
  | InscriptionIntrouvable
  | ProfilNonChoisi
  | InscriptionDejaValidee
  | EmployeuseIndisponible

/**
 * Décide le renseignement de la structure employeuse : garde l'état courant puis
 * porte l'étape « structure employeuse » franchie, et rend l'état résultant sans
 * l'exécuter. Fonction pure — c'est la couche appelante qui lit l'état, rattache
 * l'employeuse (ACL) puis projette l'état.
 *
 * Deux invariants sont portés par l'ordre du shell plutôt que par ce décideur :
 * l'ACL n'est appelée qu'après un `success` ici — une commande refusée ne crée
 * donc jamais d'employeuse pour rien — et l'état n'est projeté qu'après un
 * rattachement abouti, pour qu'une inscription ne se croie jamais plus avancée
 * que la réalité.
 */
export const renseignerStructureEmployeuse = (
  etat: InscriptionEtat | null,
  userId: UserId,
  maintenant: Date,
): Result<
  { readonly etatFranchi: InscriptionEnCours },
  RenseignerStructureEmployeuseError
> => {
  if (etat === null) return failure(InscriptionIntrouvable(userId))
  if (isNonDemarree(etat)) return failure(ProfilNonChoisi(userId))
  if (isValidee(etat)) return failure(InscriptionDejaValidee(userId))

  return success({ etatFranchi: franchirStructureEmployeuse(etat, maintenant) })
}
