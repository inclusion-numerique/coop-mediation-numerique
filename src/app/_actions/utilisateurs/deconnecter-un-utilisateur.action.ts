'use server'

import { actionBuilder } from '@/configuration/nextjs'
import { withAdmin } from '@/features/authentification/middlewares/with-admin'
import { withAuth } from '@/features/authentification/middlewares/with-auth'
import { deconnecterUnUtilisateur } from '@/features/utilisateurs/abilities/deconnecter-un-utilisateur'
import { DECONNECTER_UN_UTILISATEUR_ERRORS } from '@/features/utilisateurs/abilities/deconnecter-un-utilisateur/action/deconnecter-un-utilisateur.errors'
import { DeconnecterUnUtilisateurValidation } from '@/features/utilisateurs/abilities/deconnecter-un-utilisateur/action/deconnecter-un-utilisateur.validation'
import { fromResult, withInput } from '@/libraries/nextjs'

export const deconnecterUnUtilisateurAction = actionBuilder()
  .use(withAuth())
  .use(withAdmin())
  .use(withInput(DeconnecterUnUtilisateurValidation))
  .execute(
    fromResult(({ input }) => deconnecterUnUtilisateur(input.utilisateurId), {
      onError: DECONNECTER_UN_UTILISATEUR_ERRORS,
    }),
  )
