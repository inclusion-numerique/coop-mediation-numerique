import type { UserId } from '@app/web/features/inscription/domain'
import type { EnsureStructureEmployeuse, LierEmploi } from './ports'
import type { StructureEmployeuseInput } from './structure-employeuse-input'
import type { StructureId } from './structure-id'

export type RenseignerStructureEmployeuseInput = {
  readonly userId: UserId
  readonly structureEmployeuse: StructureEmployeuseInput
}

/**
 * Renseigne la structure employeuse de l'utilisateur : garantit l'existence de
 * la structure (ACL), puis la lie comme employeuse. Orchestration pure sur les
 * ports injectés — aucun effet ni import infra.
 */
export const renseignerStructureEmployeuse =
  (deps: {
    readonly ensureStructureEmployeuse: EnsureStructureEmployeuse
    readonly lierEmploi: LierEmploi
  }) =>
  async ({
    userId,
    structureEmployeuse,
  }: RenseignerStructureEmployeuseInput): Promise<{
    readonly structureId: StructureId
  }> => {
    const structureId = await deps.ensureStructureEmployeuse({
      userId,
      structureEmployeuse,
    })

    await deps.lierEmploi({ userId, structureId })

    return { structureId }
  }
