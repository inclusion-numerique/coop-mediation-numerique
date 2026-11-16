'use server'

import { getAuthenticatedSessionToken } from '@app/web/auth/getSessionUser'
import { actionBuilder } from '@app/web/configuration/nextjs'
import { withAuth } from '@app/web/features/authentification'
import { terminerLUsurpation } from '@app/web/features/utilisateurs/abilities/terminer-l-usurpation'
import { fromResult } from '@app/web/libraries/nextjs'

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
