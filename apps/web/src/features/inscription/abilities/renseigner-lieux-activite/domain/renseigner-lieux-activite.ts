import {
  franchirLieuxActivite,
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

export type RenseignerLieuxActiviteError =
  | InscriptionIntrouvable
  | ProfilNonChoisi
  | InscriptionDejaValidee

/**
 * Décide le renseignement des lieux d'activité côté état : garde l'état courant
 * puis porte l'étape « lieux d'activité » franchie, et rend l'état résultant sans
 * l'exécuter. Fonction pure — la réconciliation des lieux (`reconcilierLieuxActivite`)
 * et la persistance vivent dans la couche appelante.
 */
export const renseignerLieuxActivite = (
  etat: InscriptionEtat | null,
  userId: UserId,
  maintenant: Date,
): Result<
  { readonly etatFranchi: InscriptionEnCours },
  RenseignerLieuxActiviteError
> => {
  if (etat === null) return failure(InscriptionIntrouvable(userId))
  if (isNonDemarree(etat)) return failure(ProfilNonChoisi(userId))
  if (isValidee(etat)) return failure(InscriptionDejaValidee(userId))

  return success({ etatFranchi: franchirLieuxActivite(etat, maintenant) })
}
