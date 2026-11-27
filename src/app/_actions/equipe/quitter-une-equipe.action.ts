'use server'

import { actionBuilder } from '@/configuration/nextjs'
import { withAuth } from '@/features/authentification/middlewares/with-auth'
import { withMediateur } from '@/features/authentification/middlewares/with-mediateur'
import { QUITTER_UNE_EQUIPE_ERRORS } from '@/features/equipe/abilities/quitter-une-equipe/action/quitter-une-equipe.errors'
import { QuitterUneEquipeValidation } from '@/features/equipe/abilities/quitter-une-equipe/action/quitter-une-equipe.validation'
import { quitterUneEquipe } from '@/features/equipe/abilities/quitter-une-equipe/domain/quitter-une-equipe'
import { enregistrerLeDepart } from '@/features/equipe/abilities/quitter-une-equipe/implementations/prisma/enregistrer-le-depart.mutation'
import {
  CoordinateurId,
  MediateurId,
  UtilisateurId,
} from '@/features/equipe/domain'
import { lireLesAdhesionsDeLaPaire } from '@/features/equipe/implementations/prisma/adhesion.query'
import { withMaintenance } from '@/features/maintenance-mode/middlewares/with-maintenance'
import { fromResult, withInput } from '@/libraries/nextjs'
import { success } from '@/libraries/result'

export const quitterUneEquipeAction = actionBuilder()
  .use(withAuth())
  .use(withMaintenance())
  .use(withMediateur())
  .use(withInput(QuitterUneEquipeValidation))
  .execute(
    fromResult(
      async ({ user, mediateur, input }) => {
        const depart = await quitterUneEquipe({
          lireLesAdhesionsDeLaPaire,
          enregistrerLeDepart,
        })({
          mediateurId: MediateurId(mediateur.id),
          coordinateurId: CoordinateurId(input.coordinateurId),
          auteurId: UtilisateurId(user.id),
          maintenant: new Date(),
        })
        return depart.success ? success(undefined) : depart
      },
      { onError: QUITTER_UNE_EQUIPE_ERRORS },
    ),
  )
