'use server'

import { actionBuilder } from '@/configuration/nextjs'
import { getAuthenticatedSessionToken } from '@/features/authentification/implementations/session/session-user'
import { withAuth } from '@/features/authentification/middlewares/with-auth'
import { terminerLUsurpation } from '@/features/utilisateurs/abilities/terminer-l-usurpation/implementations/terminer-l-usurpation.binding'
import { fromResult } from '@/libraries/nextjs'

export const terminerLUsurpationAction = actionBuilder()
  .use(withAuth())
  .execute(
    fromResult(
      async () => terminerLUsurpation(await getAuthenticatedSessionToken()),
      {
        onError: {
          AucuneUsurpationEnCours: 'Aucune usurpation en cours',
          UsurpateurNonAdministrateur:
            'L’usurpateur n’est plus administrateur, veuillez vous déconnecter',
        },
      },
    ),
  )
