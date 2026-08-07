'use server'

import { withAuth } from '@app/web/features/authentification'
import {
  RENSEIGNER_STRUCTURE_EMPLOYEUSE_ERRORS,
  RenseignerStructureEmployeuseValidation,
} from '@app/web/features/inscription/abilities/renseigner-structure-employeuse'
import { renseignerStructureEmployeuse } from '@app/web/features/inscription/abilities/renseigner-structure-employeuse/commands/renseigner-structure-employeuse'
import { rattacherEmployeuse } from '@app/web/features/inscription/abilities/renseigner-structure-employeuse/implementation'
import { UserId } from '@app/web/features/inscription/domain'
import { actionBuilder, fromResult, withInput } from '@app/web/libraries/nextjs'

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
  .use(withInput(RenseignerStructureEmployeuseValidation))
  .execute(
    fromResult(
      ({ input, user }) =>
        renseignerStructureEmployeuse({
          command: {
            userId: UserId(user.id),
            structureEmployeuse: input.structureEmployeuse,
          },
          rattacherEmployeuse,
          maintenant: new Date(),
        }),
      { onError: RENSEIGNER_STRUCTURE_EMPLOYEUSE_ERRORS },
    ),
  )
