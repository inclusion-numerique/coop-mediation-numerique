'use server'

import { actionBuilder } from '@/configuration/nextjs'
import { withAdmin } from '@/features/authentification/middlewares/with-admin'
import { withAuth } from '@/features/authentification/middlewares/with-auth'
import { synchroniserPersonne } from '@/features/registre-des-personnes/implementations/prisma/registre-personne.mutation'
import { CHANGER_LES_ROLES_ERRORS } from '@/features/utilisateurs/abilities/changer-les-roles/action/changer-les-roles.errors'
import { ChangerLesRolesValidation } from '@/features/utilisateurs/abilities/changer-les-roles/action/changer-les-roles.validation'
import { changerLesRolesAvec } from '@/features/utilisateurs/abilities/changer-les-roles/implementations/changer-les-roles.binding'
import { AuteurId } from '@/features/utilisateurs/domain'
import { fromResult, withInput } from '@/libraries/nextjs'
import { success } from '@/libraries/result'

export const changerLesRolesAction = actionBuilder()
  .use(withAuth())
  .use(withAdmin())
  .use(withInput(ChangerLesRolesValidation))
  .execute(
    fromResult(
      async ({ input, user }) => {
        const resultat = await changerLesRolesAvec(synchroniserPersonne)({
          ...input,
          auteur: {
            _tag: 'administrateur',
            administrateurId: AuteurId(user.id),
          },
        })
        return resultat.success ? success(undefined) : resultat
      },
      { onError: CHANGER_LES_ROLES_ERRORS },
    ),
  )
