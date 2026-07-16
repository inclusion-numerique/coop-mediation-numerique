import type { UserId } from '@app/web/features/inscription/domain'
import { type Result, success } from '@app/web/libraries/result'
import type {
  EnsureStructureEmployeuse,
  StructureEmployeuseInput,
  StructureId,
} from '../domain'
import {
  renseignerStructureEmployeuse as deciderRenseignerStructureEmployeuse,
  type RenseignerStructureEmployeuseError,
} from '../domain/renseigner-structure-employeuse'
import { getInscriptionEtat, lierEmploi } from '../implementation'

/**
 * Cas d'usage « renseigner la structure employeuse » : lit l'état, délègue la
 * décision au domaine (pur), puis garantit la structure (ACL cross-feature,
 * injectée) et lie l'emploi. L'ordre garde-avant-ACL est porté ici : l'ACL n'est
 * appelée qu'après un `success` du domaine — une commande refusée ne crée donc
 * jamais de structure pour rien.
 */
export const renseignerStructureEmployeuse = async ({
  command: { userId, structureEmployeuse },
  ensureStructureEmployeuse,
  maintenant,
}: {
  readonly command: {
    readonly userId: UserId
    readonly structureEmployeuse: StructureEmployeuseInput
  }
  readonly ensureStructureEmployeuse: EnsureStructureEmployeuse
  readonly maintenant: Date
}): Promise<
  Result<
    { readonly structureId: StructureId },
    RenseignerStructureEmployeuseError
  >
> => {
  const decision = deciderRenseignerStructureEmployeuse(
    await getInscriptionEtat(userId),
    userId,
    maintenant,
  )

  if (!decision.success) return decision

  const structureId = await ensureStructureEmployeuse({
    userId,
    structureEmployeuse,
  })
  await lierEmploi({ etat: decision.data.etatFranchi, structureId })

  return success({ structureId })
}
