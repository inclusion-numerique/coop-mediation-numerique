'use server'

import { getAuthenticatedSessionToken } from '@/auth/getSessionUser'
import { actionBuilder } from '@/configuration/nextjs'
import { withAdmin, withAuth } from '@/features/authentification'
import {
  PorteeUsurpation,
  usurperUnUtilisateur,
} from '@/features/utilisateurs/abilities/usurper-un-utilisateur'
import { USURPER_UN_UTILISATEUR_ERRORS } from '@/features/utilisateurs/abilities/usurper-un-utilisateur/action/usurper-un-utilisateur.errors'
import { UsurperUnUtilisateurValidation } from '@/features/utilisateurs/abilities/usurper-un-utilisateur/action/usurper-un-utilisateur.validation'
import { identifiantsDe } from '@/features/utilisateurs/domain'
import { fromResult, withInput } from '@/libraries/nextjs'
import { success } from '@/libraries/result'
import { ServerWebAppConfig } from '@/ServerWebAppConfig'
import { getLoginRedirectUrl } from '@/security/getHomepage'

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
          portee: PorteeUsurpation(
            ServerWebAppConfig.Sudo.usurpation
              ? 'TousLesComptes'
              : 'FixturesSeulement',
          ),
        })

        if (!resultat.success) return resultat

        const cible = resultat.data
        const { mediateurId, coordinateurId } = identifiantsDe(
          cible.rattachements,
        )
        return success({
          nom: cible.nom,
          redirection: getLoginRedirectUrl({
            role: cible.role,
            inscriptionValidee:
              cible.inscription._tag === 'Le' ? cible.inscription.date : null,
            mediateur: mediateurId === null ? null : { id: mediateurId },
            coordinateur:
              coordinateurId === null ? null : { id: coordinateurId },
          }),
        })
      },
      { onError: USURPER_UN_UTILISATEUR_ERRORS },
    ),
  )
