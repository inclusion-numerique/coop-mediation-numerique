import {
  franchirStructureEmployeuse,
  type GetInscriptionEtat,
  InscriptionDejaValidee,
  InscriptionIntrouvable,
  isNonDemarree,
  isValidee,
  ProfilNonChoisi,
  type UserId,
} from '@app/web/features/inscription/domain'
import { failure, type Result, success } from '@app/web/libraries/result'
import type { EnsureStructureEmployeuse, LierEmploi } from './ports'
import type { StructureEmployeuseInput } from './structure-employeuse-input'
import type { StructureId } from './structure-id'

export type RenseignerStructureEmployeuseInput = {
  readonly userId: UserId
  readonly structureEmployeuse: StructureEmployeuseInput
}

export type RenseignerStructureEmployeuseError =
  | InscriptionIntrouvable
  | ProfilNonChoisi
  | InscriptionDejaValidee

/**
 * Renseigne la structure employeuse de l'utilisateur : garantit l'existence de
 * la structure (ACL), puis la lie comme employeuse en portant l'étape franchie.
 * Orchestration pure sur les ports injectés — aucun effet ni import infra.
 *
 * L'état est lu et gardé AVANT l'ACL : une commande refusée ne doit pas laisser
 * derrière elle une structure créée pour rien.
 */
export const renseignerStructureEmployeuse =
  (deps: {
    readonly getInscriptionEtat: GetInscriptionEtat
    readonly ensureStructureEmployeuse: EnsureStructureEmployeuse
    readonly lierEmploi: LierEmploi
    readonly maintenant: Date
  }) =>
  async ({
    userId,
    structureEmployeuse,
  }: RenseignerStructureEmployeuseInput): Promise<
    Result<
      { readonly structureId: StructureId },
      RenseignerStructureEmployeuseError
    >
  > => {
    const etat = await deps.getInscriptionEtat(userId)

    if (etat === null) return failure(InscriptionIntrouvable(userId))
    if (isNonDemarree(etat)) return failure(ProfilNonChoisi(userId))
    if (isValidee(etat)) return failure(InscriptionDejaValidee(userId))

    const structureId = await deps.ensureStructureEmployeuse({
      userId,
      structureEmployeuse,
    })

    await deps.lierEmploi({
      etat: franchirStructureEmployeuse(etat, deps.maintenant),
      structureId,
    })

    return success({ structureId })
  }
