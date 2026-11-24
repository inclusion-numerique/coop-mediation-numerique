import type { UtilisateurId } from '@/features/inscription/domain'
import type { LireLEtatDeLInscription } from '@/features/inscription/domain/ports'
import { failure, type Result, success } from '@/libraries/result'
import {
  deciderLaStructureEmployeuse,
  type RenseignerStructureEmployeuseError,
} from './decider-la-structure-employeuse'
import { EmployeuseIndisponible } from './errors'
import type { ProjeterEtapeFranchie, RattacherEmployeuse } from './ports'
import {
  type StructureEmployeuseInput,
  saisieEmployeuse,
} from './structure-employeuse-input'

export type RenseignerStructureEmployeusePorts = {
  readonly lireLEtat: LireLEtatDeLInscription
  readonly rattacherEmployeuse: RattacherEmployeuse
  readonly projeterEtapeFranchie: ProjeterEtapeFranchie
}

export const renseignerStructureEmployeuse =
  ({
    lireLEtat,
    rattacherEmployeuse,
    projeterEtapeFranchie,
  }: RenseignerStructureEmployeusePorts) =>
  async ({
    command: { userId, structureEmployeuse },
    maintenant,
  }: {
    readonly command: {
      readonly userId: UtilisateurId
      readonly structureEmployeuse: StructureEmployeuseInput
    }
    readonly maintenant: Date
  }): Promise<Result<void, RenseignerStructureEmployeuseError>> => {
    const decision = deciderLaStructureEmployeuse(
      await lireLEtat(userId),
      userId,
      maintenant,
    )

    if (!decision.success) return decision

    const rattachement = await rattacherEmployeuse({
      userId,
      saisie: saisieEmployeuse(structureEmployeuse),
    })

    if (rattachement._tag !== 'rattachee') {
      return failure(EmployeuseIndisponible(userId))
    }

    await projeterEtapeFranchie(decision.data.etatFranchi)

    return success(undefined)
  }
