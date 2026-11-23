'use server'

import { actionBuilder } from '@/configuration/nextjs'
import { withAuth } from '@/features/authentification'
import { getAuthenticatedSessionToken } from '@/features/authentification/implementations/session/getSessionUser'
import { terminerLUsurpation } from '@/features/utilisateurs/abilities/terminer-l-usurpation'
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
