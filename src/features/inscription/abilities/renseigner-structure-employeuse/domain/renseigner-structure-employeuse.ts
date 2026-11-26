import type { UtilisateurId } from '@/features/inscription/domain'
import { failure, type Result, success } from '@/libraries/result'
import { deciderLaStructureEmployeuse } from './decider-la-structure-employeuse'
import {
  type EchecDeRenseignerStructureEmployeuse,
  EmployeuseNonRattachee,
} from './errors'
import type { RenseignerStructureEmployeusePorts } from './ports'
import type { StructureEmployeuseRenseignee } from './structure-employeuse-renseignee'

export const renseignerStructureEmployeuse =
  <Employeuse, Rattachement>({
    lireLEtat,
    rattacherEmployeuse,
    projeterEtapeFranchie,
  }: RenseignerStructureEmployeusePorts<Employeuse, Rattachement>) =>
  async ({
    command: { userId, employeuse },
    maintenant,
  }: {
    readonly command: {
      readonly userId: UtilisateurId
      readonly employeuse: Employeuse
    }
    readonly maintenant: Date
  }): Promise<
    Result<
      StructureEmployeuseRenseignee<Employeuse, Rattachement>,
      EchecDeRenseignerStructureEmployeuse
    >
  > => {
    const etatFranchi = deciderLaStructureEmployeuse({
      etat: await lireLEtat(userId),
      userId,
      maintenant,
    })

    if (!etatFranchi.success) return etatFranchi

    const rattachement = await rattacherEmployeuse({ userId, employeuse })

    if (!rattachement.success) return failure(EmployeuseNonRattachee(userId))

    await projeterEtapeFranchie(etatFranchi.data)

    return success({
      employeuse,
      rattachement: rattachement.data,
      etatFranchi: etatFranchi.data,
    })
  }
