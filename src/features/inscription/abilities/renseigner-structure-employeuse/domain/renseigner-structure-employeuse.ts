import type { UtilisateurId } from '@/features/inscription/domain'
import { failure, type Result, success } from '@/libraries/result'
import { deciderLaStructureEmployeuse } from './decider-la-structure-employeuse'
import {
  type EchecDeRenseignerStructureEmployeuse,
  EmployeuseIndisponible,
} from './errors'
import type { RenseignerStructureEmployeusePorts } from './ports'
import type { SaisieEmployeuse } from './saisie-employeuse'
import type { StructureEmployeuseRenseignee } from './structure-employeuse-renseignee'

export const renseignerStructureEmployeuse =
  ({
    lireLEtat,
    rattacherEmployeuse,
    projeterEtapeFranchie,
  }: RenseignerStructureEmployeusePorts) =>
  async ({
    command: { userId, saisie },
    maintenant,
  }: {
    readonly command: {
      readonly userId: UtilisateurId
      readonly saisie: SaisieEmployeuse
    }
    readonly maintenant: Date
  }): Promise<
    Result<StructureEmployeuseRenseignee, EchecDeRenseignerStructureEmployeuse>
  > => {
    const etatFranchi = deciderLaStructureEmployeuse({
      etat: await lireLEtat(userId),
      userId,
      maintenant,
    })

    if (!etatFranchi.success) return etatFranchi

    const rattachement = await rattacherEmployeuse({ userId, saisie })

    if (!rattachement.success) return failure(EmployeuseIndisponible(userId))

    await projeterEtapeFranchie(etatFranchi.data)

    return success({ saisie, etatFranchi: etatFranchi.data })
  }
