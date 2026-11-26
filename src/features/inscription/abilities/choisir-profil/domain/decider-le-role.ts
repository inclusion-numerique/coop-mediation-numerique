import {
  estValidee,
  InscriptionDejaValidee,
  type InscriptionEtat,
  InscriptionIntrouvable,
  poserRole,
  type Role,
  type UtilisateurId,
} from '@/features/inscription/domain'
import { failure, type Result, success } from '@/libraries/result'
import type { EnregistrerProfilChoisiInput } from './ports'
import { rolesACreerPourRole } from './roles-a-creer'

export type RoleChoisi = {
  readonly userId: UtilisateurId
  readonly role: Role
}

export type ChoisirProfilError = InscriptionIntrouvable | InscriptionDejaValidee

/**
 * Décide — ou re-décide — le rôle d'inscription : garde l'état courant puis
 * applique la transition, et rend la charge à écrire (état résultant + comptes
 * de rôle) sans l'exécuter. Fonction pure : c'est la couche appelante qui lit
 * l'état et projette `aEnregistrer` en une seule écriture.
 */
export const deciderLeRole = (
  etat: InscriptionEtat | null,
  { userId, role }: RoleChoisi,
  maintenant: Date,
): Result<
  { readonly role: Role; readonly aEnregistrer: EnregistrerProfilChoisiInput },
  ChoisirProfilError
> => {
  if (etat === null) return failure(InscriptionIntrouvable(userId))
  if (estValidee(etat)) return failure(InscriptionDejaValidee(userId))

  return success({
    role,
    aEnregistrer: {
      etat: poserRole(etat, role, maintenant),
      roles: rolesACreerPourRole(role),
    },
  })
}
