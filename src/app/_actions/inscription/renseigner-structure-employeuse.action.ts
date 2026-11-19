'use server'

import { actionBuilder } from '@/configuration/nextjs'
import { withAuth } from '@/features/authentification'
import { rattacherAUneEmployeuseSaisieBinding } from '@/features/employeuse/server'
import {
  RENSEIGNER_STRUCTURE_EMPLOYEUSE_ERRORS,
  RenseignerStructureEmployeuseValidation,
} from '@/features/inscription/abilities/renseigner-structure-employeuse'
import { renseignerStructureEmployeuse } from '@/features/inscription/abilities/renseigner-structure-employeuse/commands/renseigner-structure-employeuse'
import { UserId } from '@/features/inscription/domain'
import { withMaintenance } from '@/features/maintenance-mode'
import { fromResult, withInput } from '@/libraries/nextjs'

/**
 * Étape d'inscription « ma structure employeuse ».
 *
 * Le rattachement lui-même appartient à la feature employeuse, atteinte par le
 * port `rattacherEmployeuse` ; l'inscription n'ajoute que ce qui la concerne —
 * l'horodatage de l'étape franchie, qui conditionne la suite du parcours.
 *
 * L'utilisateur vient de la session, jamais de l'input : c'est ce qui remplace
 * la garde d'appartenance que portait la procédure tRPC.
 */
export const renseignerStructureEmployeuseAction = actionBuilder()
  .use(withAuth())
  .use(withMaintenance())
  .use(withInput(RenseignerStructureEmployeuseValidation))
  .execute(
    fromResult(
      ({ input, user }) =>
        renseignerStructureEmployeuse({
          command: {
            userId: UserId(user.id),
            structureEmployeuse: input.structureEmployeuse,
          },
          rattacherEmployeuse: rattacherAUneEmployeuseSaisieBinding,
          maintenant: new Date(),
        }),
      { onError: RENSEIGNER_STRUCTURE_EMPLOYEUSE_ERRORS },
    ),
  )
