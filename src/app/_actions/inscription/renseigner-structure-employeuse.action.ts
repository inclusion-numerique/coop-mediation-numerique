'use server'

import { actionBuilder } from '@/configuration/nextjs'
import { withAuth } from '@/features/authentification/middlewares/with-auth'
import { RenseignerStructureEmployeuseValidation } from '@/features/employeuse/abilities/rattacher-a-une-employeuse/domain/employeuse-choisie'
import { rattacherAUneEmployeuseSaisieBinding } from '@/features/employeuse/abilities/rattacher-a-une-employeuse/implementations/rattacher-a-une-employeuse.binding'
import { RENSEIGNER_STRUCTURE_EMPLOYEUSE_ERRORS } from '@/features/inscription/abilities/renseigner-structure-employeuse'
import { renseignerStructureEmployeuse } from '@/features/inscription/abilities/renseigner-structure-employeuse/commands/renseigner-structure-employeuse'
import { UserId } from '@/features/inscription/domain'
import { withMaintenance } from '@/features/maintenance-mode/middlewares/with-maintenance'
import {
  ensurePersonneMain,
  synchroniserPersonne,
} from '@/features/registre-des-personnes/implementations/prisma/registre-personne.mutation'
import { fromResult, withInput } from '@/libraries/nextjs'
import { success } from '@/libraries/result'

const registreDesPersonnes = {
  garantirLaPersonne: ensurePersonneMain,
  synchroniserLaPersonne: synchroniserPersonne,
}

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
      async ({ input, user }) => {
        const resultat = await renseignerStructureEmployeuse({
          command: {
            userId: UserId(user.id),
            structureEmployeuse: input.structure,
          },
          rattacherEmployeuse:
            rattacherAUneEmployeuseSaisieBinding(registreDesPersonnes),
          maintenant: new Date(),
        })

        return resultat.success ? success({ rattachee: true }) : resultat
      },
      { onError: RENSEIGNER_STRUCTURE_EMPLOYEUSE_ERRORS },
    ),
  )
