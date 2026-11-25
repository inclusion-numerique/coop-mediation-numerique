'use server'

import { actionBuilder } from '@/configuration/nextjs'
import { getAuthenticatedSessionToken } from '@/features/authentification/implementations/session/session-user.query'
import { withAuth } from '@/features/authentification/middlewares/with-auth'
import { terminerLUsurpation as terminer } from '@/features/utilisateurs/abilities/terminer-l-usurpation/domain/terminer-l-usurpation'
import {
  rendreLaSession,
  sessionCourante,
} from '@/features/utilisateurs/abilities/terminer-l-usurpation/implementations/prisma/session-courante.mutation'
import { fromResult } from '@/libraries/nextjs'

const terminerLUsurpation = terminer({
  lireLaSession: sessionCourante,
  rendreLaSession,
})

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
