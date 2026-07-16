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

export type RenseignerStructureEmployeuseError =
  | InscriptionIntrouvable
  | ProfilNonChoisi
  | InscriptionDejaValidee

/**
 * Décide le renseignement de la structure employeuse : garde l'état courant puis
 * porte l'étape « structure employeuse » franchie, et rend l'état résultant sans
 * l'exécuter. Fonction pure — c'est la couche appelante qui lit l'état, garantit
 * la structure (ACL) et lie l'emploi.
 *
 * L'invariant « une commande refusée ne crée pas de structure pour rien » est
 * porté par l'ordre du shell : l'ACL n'est appelée qu'après un `success` ici.
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
