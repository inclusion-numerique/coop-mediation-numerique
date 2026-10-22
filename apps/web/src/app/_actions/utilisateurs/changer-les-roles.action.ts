'use server'

import { withAdmin, withAuth } from '@app/web/features/authentification'
import { changerLesRoles } from '@app/web/features/utilisateurs/abilities/changer-les-roles'
import { CHANGER_LES_ROLES_ERRORS } from '@app/web/features/utilisateurs/abilities/changer-les-roles/action/changer-les-roles.errors'
import { ChangerLesRolesValidation } from '@app/web/features/utilisateurs/abilities/changer-les-roles/action/changer-les-roles.validation'
import { AuteurId } from '@app/web/features/utilisateurs/domain'
import { actionBuilder, fromResult, withInput } from '@app/web/libraries/nextjs'
import { success } from '@app/web/libraries/result'

export const changerLesRolesAction = actionBuilder()
  .use(withAuth())
  .use(withAdmin())
  .use(withInput(ChangerLesRolesValidation))
  .execute(
    fromResult(
      async ({ input, user }) => {
        const resultat = await changerLesRoles({
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
