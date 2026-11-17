'use server'

import { actionBuilder } from '@/configuration/nextjs'
import { withAdmin, withAuth } from '@/features/authentification'
import { changerLesRoles } from '@/features/utilisateurs/abilities/changer-les-roles'
import { CHANGER_LES_ROLES_ERRORS } from '@/features/utilisateurs/abilities/changer-les-roles/action/changer-les-roles.errors'
import { ChangerLesRolesValidation } from '@/features/utilisateurs/abilities/changer-les-roles/action/changer-les-roles.validation'
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
