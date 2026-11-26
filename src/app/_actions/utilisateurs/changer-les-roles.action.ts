'use server'

import { actionBuilder } from '@/configuration/nextjs'
import { withAdmin } from '@/features/authentification/middlewares/with-admin'
import { withAuth } from '@/features/authentification/middlewares/with-auth'
import { synchroniserPersonne } from '@/features/registre-des-personnes/implementations/prisma/registre-personne.mutation'
import { CHANGER_LES_ROLES_ERRORS } from '@/features/utilisateurs/abilities/changer-les-roles/action/changer-les-roles.errors'
import { ChangerLesRolesValidation } from '@/features/utilisateurs/abilities/changer-les-roles/action/changer-les-roles.validation'
import { changerLesRoles } from '@/features/utilisateurs/abilities/changer-les-roles/domain/changer-les-roles'
import { appliquerLePlan } from '@/features/utilisateurs/abilities/changer-les-roles/implementations/prisma/appliquer-le-plan.mutation'
import { compteAReaffecter } from '@/features/utilisateurs/abilities/changer-les-roles/implementations/prisma/compte-a-reaffecter.query'
import { journaliserLeChangement } from '@/features/utilisateurs/abilities/changer-les-roles/implementations/prisma/journaliser-le-changement.mutation'
import { AuteurId } from '@/features/utilisateurs/domain'
import type { SynchroniserLaPersonne } from '@/features/utilisateurs/implementations/prisma/registre-des-personnes.mutation'
import { fromResult, withInput } from '@/libraries/nextjs'
import { success } from '@/libraries/result'

const changerLesRolesAvec = (synchroniserLaPersonne: SynchroniserLaPersonne) =>
  changerLesRoles({
    lireLeCompteAReaffecter: compteAReaffecter,
    appliquerLePlan: appliquerLePlan(synchroniserLaPersonne),
    journaliserLeChangement,
  })

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
