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

export const deciderLesLieux = ({
  etat,
  userId,
  maintenant,
}: {
  readonly etat: InscriptionEtat | null
  readonly userId: UtilisateurId
  readonly maintenant: Date
}): Result<
  InscriptionEnCours,
  InscriptionIntrouvable | ProfilNonChoisi | InscriptionDejaValidee
> => {
  if (etat === null) return failure(InscriptionIntrouvable(userId))
  if (estNonDemarree(etat)) return failure(ProfilNonChoisi(userId))
  if (estValidee(etat)) return failure(InscriptionDejaValidee(userId))

  return success(franchirLieuxActivite(etat, maintenant))
}
