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
import type { EchecDeChoisirProfil } from './errors'
import type { EnregistrerProfilChoisiInput } from './ports'
import { rolesACreerPourRole } from './roles-a-creer'

export const deciderLeRole = ({
  etat,
  userId,
  role,
  maintenant,
}: {
  readonly etat: InscriptionEtat | null
  readonly userId: UtilisateurId
  readonly role: Role
  readonly maintenant: Date
}): Result<EnregistrerProfilChoisiInput, EchecDeChoisirProfil> => {
  if (etat === null) return failure(InscriptionIntrouvable(userId))
  if (estValidee(etat)) return failure(InscriptionDejaValidee(userId))

  return success({
    etat: poserRole(etat, role, maintenant),
    roles: rolesACreerPourRole(role),
  })
}
