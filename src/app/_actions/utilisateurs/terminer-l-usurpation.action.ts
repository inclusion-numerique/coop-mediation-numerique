'use server'

import { actionBuilder } from '@/configuration/nextjs'
import { getAuthenticatedSessionToken } from '@/features/authentification/implementations/session/session-token-from-cookies.query'
import { withAuth } from '@/features/authentification/middlewares/with-auth'
import { terminerLUsurpation as terminer } from '@/features/utilisateurs/abilities/terminer-l-usurpation/domain/terminer-l-usurpation'
import {
  rendreLaSession,
  sessionCourante,
} from '@/features/utilisateurs/abilities/terminer-l-usurpation/implementations/prisma/session-courante.mutation'
import { fromResult } from '@/libraries/nextjs'
import { success } from '@/libraries/result'

const terminerLUsurpation = terminer({
  lireLaSession: sessionCourante,
  rendreLaSession,
})

export const terminerLUsurpationAction = actionBuilder()
  .use(withAuth())
  .execute(
    fromResult(
      async () => {
        const resultat = await terminerLUsurpation({
          jeton: await getAuthenticatedSessionToken(),
        })
        return resultat.success ? success({ nom: resultat.data.nom }) : resultat
      },
      {
        onError: {
          AucuneUsurpationEnCours: 'Aucune usurpation en cours',
          UsurpateurNonAdministrateur:
            'L’usurpateur n’est plus administrateur, veuillez vous déconnecter',
        },
      },
    ),
  )
