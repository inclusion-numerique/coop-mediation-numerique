import {
  InscriptionDejaValidee,
  type InscriptionEtat,
  InscriptionIntrouvable,
  isValidee,
  poserRole,
  type Role,
  type UserId,
} from '@app/web/features/inscription/domain'
import { failure, type Result, success } from '@app/web/libraries/result'
import type { EnregistrerProfilChoisiInput } from './ports'
import { rolesACreerPourRole } from './roles-a-creer'

/**
 * Rôles choisissables à la première étape : le statut conseiller numérique ne se
 * choisit pas, il provient du Dataspace.
 */
export const rolesDisponibles = ['Mediateur', 'Coordinateur'] as const

export type RoleDisponible = (typeof rolesDisponibles)[number]

export type RoleChoisi = {
  readonly userId: UserId
  readonly role: Role
}

export type ChoisirProfilError = InscriptionIntrouvable | InscriptionDejaValidee

/**
 * Décide — ou re-décide — le rôle d'inscription : garde l'état courant puis
 * applique la transition, et rend la charge à écrire (état résultant + comptes
 * de rôle) sans l'exécuter. Fonction pure : c'est la couche appelante qui lit
 * l'état et projette `aEnregistrer` en une seule écriture.
 */
export const choisirProfil = (
  etat: InscriptionEtat | null,
  { userId, role }: RoleChoisi,
  maintenant: Date,
): Result<
  { readonly role: Role; readonly aEnregistrer: EnregistrerProfilChoisiInput },
  ChoisirProfilError
> => {
  if (etat === null) return failure(InscriptionIntrouvable(userId))
  if (isValidee(etat)) return failure(InscriptionDejaValidee(userId))

  return success({
    role,
    aEnregistrer: {
      etat: poserRole(etat, role, maintenant),
      roles: rolesACreerPourRole(role),
    },
  })
}
