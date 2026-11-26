'use server'

import { actionBuilder } from '@/configuration/nextjs'
import { withAdmin } from '@/features/authentification/middlewares/with-admin'
import { withAuth } from '@/features/authentification/middlewares/with-auth'
import { synchroniserPersonne } from '@/features/registre-des-personnes/implementations/prisma/registre-personne.mutation'
import { CHANGER_LES_ROLES_ERRORS } from '@/features/utilisateurs/abilities/changer-les-roles/action/changer-les-roles.errors'
import { ChangerLesRolesValidation } from '@/features/utilisateurs/abilities/changer-les-roles/action/changer-les-roles.validation'
import { changerLesRoles } from '@/features/utilisateurs/abilities/changer-les-roles/domain/changer-les-roles'
import { AuteurId, UtilisateurId } from '@/features/utilisateurs/domain'
import { appliquerLePlan } from '@/features/utilisateurs/implementations/prisma/appliquer-le-plan.mutation'
import { compteAReaffecter } from '@/features/utilisateurs/implementations/prisma/compte-a-reaffecter.query'
import { journaliserLeChangement } from '@/features/utilisateurs/implementations/prisma/journaliser-le-changement.mutation'
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
          utilisateurId: UtilisateurId.safe(input.utilisateurId),
          mediateur: input.mediateur,
          coordinateur: input.coordinateur,
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
