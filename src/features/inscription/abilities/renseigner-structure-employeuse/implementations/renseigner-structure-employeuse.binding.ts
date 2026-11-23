import { getInscriptionEtat } from '@/features/inscription/implementations/prisma/get-inscription-etat.query'
import type { RattacherEmployeuse } from '../domain/ports'
import { renseignerStructureEmployeuse } from '../domain/renseigner-structure-employeuse'
import { projeterEtapeFranchie } from './prisma/projeter-etape-franchie.mutation'

export const renseignerStructureEmployeuseAvec = (
  rattacherEmployeuse: RattacherEmployeuse,
) =>
  renseignerStructureEmployeuse({
    lireLEtat: getInscriptionEtat,
    rattacherEmployeuse,
    projeterEtapeFranchie,
  })
