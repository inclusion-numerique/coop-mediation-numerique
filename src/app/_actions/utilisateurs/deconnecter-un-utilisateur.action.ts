'use server'

import { actionBuilder } from '@/configuration/nextjs'
import { withAdmin } from '@/features/authentification/middlewares/with-admin'
import { withAuth } from '@/features/authentification/middlewares/with-auth'
import { DECONNECTER_UN_UTILISATEUR_ERRORS } from '@/features/utilisateurs/abilities/deconnecter-un-utilisateur/action/deconnecter-un-utilisateur.errors'
import { DeconnecterUnUtilisateurValidation } from '@/features/utilisateurs/abilities/deconnecter-un-utilisateur/action/deconnecter-un-utilisateur.validation'
import { deconnecterUnUtilisateur } from '@/features/utilisateurs/abilities/deconnecter-un-utilisateur/domain/deconnecter-un-utilisateur'
import { compteExiste } from '@/features/utilisateurs/abilities/deconnecter-un-utilisateur/implementations/prisma/compte-existe.query'
import { fermerLesSessions } from '@/features/utilisateurs/abilities/deconnecter-un-utilisateur/implementations/prisma/fermer-les-sessions.mutation'
import { fromResult, withInput } from '@/libraries/nextjs'
import { success } from '@/libraries/result'

export const deconnecterUnUtilisateurAction = actionBuilder()
  .use(withAuth())
  .use(withAdmin())
  .use(withInput(DeconnecterUnUtilisateurValidation))
  .execute(
    fromResult(
      async ({ input }) => {
        const resultat = await deconnecterUnUtilisateur({
          compteExiste,
          fermerLesSessions,
        })({ utilisateurId: input.utilisateurId })
        return resultat.success
          ? success({ sessionsFermees: resultat.data.sessionsFermees })
          : resultat
      },
      { onError: DECONNECTER_UN_UTILISATEUR_ERRORS },
    ),
  )
