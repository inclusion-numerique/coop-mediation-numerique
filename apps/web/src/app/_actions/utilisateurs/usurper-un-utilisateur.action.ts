'use server'

import { getAuthenticatedSessionToken } from '@app/web/auth/getSessionUser'
import { withAdmin, withAuth } from '@app/web/features/authentification'
import { usurperUnUtilisateur } from '@app/web/features/utilisateurs/abilities/usurper-un-utilisateur'
import { USURPER_UN_UTILISATEUR_ERRORS } from '@app/web/features/utilisateurs/abilities/usurper-un-utilisateur/action/usurper-un-utilisateur.errors'
import { UsurperUnUtilisateurValidation } from '@app/web/features/utilisateurs/abilities/usurper-un-utilisateur/action/usurper-un-utilisateur.validation'
import { actionBuilder, fromResult, withInput } from '@app/web/libraries/nextjs'
import { success } from '@app/web/libraries/result'
import { ServerWebAppConfig } from '@app/web/ServerWebAppConfig'
import { getLoginRedirectUrl } from '@app/web/security/getHomepage'

export const usurperUnUtilisateurAction = actionBuilder()
  .use(withAuth())
  .use(withAdmin())
  .use(withInput(UsurperUnUtilisateurValidation))
  .execute(
    fromResult(
      async ({ input, user }) => {
        const resultat = await usurperUnUtilisateur({
          utilisateurId: input.utilisateurId,
          usurpateurId: user.id,
          jetonDeSession: await getAuthenticatedSessionToken(),
          portee: ServerWebAppConfig.Sudo.usurpation
            ? 'TousLesComptes'
            : 'FixturesSeulement',
        })

        if (!resultat.success) return resultat

        const cible = resultat.data
        return success({
          nom: cible.nom,
          redirection: getLoginRedirectUrl({
            role: cible.role,
            inscriptionValidee: cible.inscritLe,
            mediateur:
              cible.mediateurId === null ? null : { id: cible.mediateurId },
            coordinateur:
              cible.coordinateurId === null
                ? null
                : { id: cible.coordinateurId },
          }),
        })
      },
      { onError: USURPER_UN_UTILISATEUR_ERRORS },
    ),
  )
