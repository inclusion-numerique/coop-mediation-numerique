import type { UserId } from '@app/web/features/inscription/domain'
import { failure, type Result, success } from '@app/web/libraries/result'
import type { RattacherEmployeuse, StructureEmployeuseInput } from '../domain'
import { EmployeuseIndisponible } from '../domain'
import {
  renseignerStructureEmployeuse as deciderRenseignerStructureEmployeuse,
  type RenseignerStructureEmployeuseError,
} from '../domain/renseigner-structure-employeuse'
import { getInscriptionEtat, projeterEtapeFranchie } from '../implementation'

/**
 * Cas d'usage « renseigner la structure employeuse » : lit l'état, délègue la
 * décision au domaine (pur), puis rattache l'employeuse (ACL cross-feature,
 * injectée) et projette l'état.
 *
 * L'ordre porte deux invariants que le décideur ne peut pas exprimer seul :
 * l'ACL n'est appelée qu'après un `success` du domaine — une commande refusée ne
 * crée donc jamais d'employeuse pour rien — et l'état n'est projeté qu'après un
 * rattachement abouti, faute de quoi l'inscription se croirait avancée alors que
 * l'utilisateur n'a aucune employeuse, et le renverrait indéfiniment ici.
 */
export const renseignerStructureEmployeuse = async ({
  command: { userId, structureEmployeuse },
  rattacherEmployeuse,
  maintenant,
}: {
  readonly command: {
    readonly userId: UserId
    readonly structureEmployeuse: StructureEmployeuseInput
  }
  readonly rattacherEmployeuse: RattacherEmployeuse
  readonly maintenant: Date
}): Promise<Result<void, RenseignerStructureEmployeuseError>> => {
  const decision = deciderRenseignerStructureEmployeuse(
    await getInscriptionEtat(userId),
    userId,
    maintenant,
  )

  if (!decision.success) return decision

  const rattachement = await rattacherEmployeuse({
    userId,
    structureEmployeuse,
  })

  if (rattachement === 'indisponible') {
    return failure(EmployeuseIndisponible(userId))
  }

  await projeterEtapeFranchie(decision.data.etatFranchi)

  return success(undefined)
}
