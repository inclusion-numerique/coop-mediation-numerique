'use server'

import { withAdmin, withAuth } from '@app/web/features/authentification'
import { deconnecterUnUtilisateur } from '@app/web/features/utilisateurs/abilities/deconnecter-un-utilisateur'
import { DECONNECTER_UN_UTILISATEUR_ERRORS } from '@app/web/features/utilisateurs/abilities/deconnecter-un-utilisateur/action/deconnecter-un-utilisateur.errors'
import { DeconnecterUnUtilisateurValidation } from '@app/web/features/utilisateurs/abilities/deconnecter-un-utilisateur/action/deconnecter-un-utilisateur.validation'
import { actionBuilder, fromResult, withInput } from '@app/web/libraries/nextjs'

export const deconnecterUnUtilisateurAction = actionBuilder()
  .use(withAuth())
  .use(withAdmin())
  .use(withInput(DeconnecterUnUtilisateurValidation))
  .execute(
    fromResult(({ input }) => deconnecterUnUtilisateur(input.utilisateurId), {
      onError: DECONNECTER_UN_UTILISATEUR_ERRORS,
    }),
  )
