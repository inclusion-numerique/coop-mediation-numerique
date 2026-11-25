import {
  estNonDemarree,
  estValidee,
  franchirLieuxActivite,
  InscriptionDejaValidee,
  type InscriptionEnCours,
  type InscriptionEtat,
  InscriptionIntrouvable,
  ProfilNonChoisi,
  type UtilisateurId,
} from '@/features/inscription/domain'
import { failure, type Result, success } from '@/libraries/result'

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
export const deciderLesLieux = (
  etat: InscriptionEtat | null,
  userId: UtilisateurId,
  maintenant: Date,
): Result<
  { readonly etatFranchi: InscriptionEnCours },
  RenseignerLieuxActiviteError
> => {
  if (etat === null) return failure(InscriptionIntrouvable(userId))
  if (estNonDemarree(etat)) return failure(ProfilNonChoisi(userId))
  if (estValidee(etat)) return failure(InscriptionDejaValidee(userId))

  return success({ etatFranchi: franchirLieuxActivite(etat, maintenant) })
}
