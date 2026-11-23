'use server'

import { actionBuilder } from '@/configuration/nextjs'
import { withAuth } from '@/features/authentification/middlewares/with-auth'
import { withMediateur } from '@/features/authentification/middlewares/with-mediateur'
import { QUITTER_UNE_EQUIPE_ERRORS } from '@/features/equipe/abilities/quitter-une-equipe/action/quitter-une-equipe.errors'
import { QuitterUneEquipeValidation } from '@/features/equipe/abilities/quitter-une-equipe/action/quitter-une-equipe.validation'
import { quitterUneEquipe } from '@/features/equipe/abilities/quitter-une-equipe/implementations/prisma/quitter-une-equipe.mutation'
import {
  CoordinateurId,
  MediateurId,
  UtilisateurId,
} from '@/features/equipe/domain'
import { withMaintenance } from '@/features/maintenance-mode/middlewares/with-maintenance'
import { fromResult, withInput } from '@/libraries/nextjs'

export const quitterUneEquipeAction = actionBuilder()
  .use(withAuth())
  .use(withMaintenance())
  .use(withMediateur())
  .use(withInput(QuitterUneEquipeValidation))
  .execute(
    fromResult(
      async ({ user, mediateur, input }) =>
        quitterUneEquipe({
          mediateurId: MediateurId(mediateur.id),
          coordinateurId: CoordinateurId(input.coordinateurId),
          auteurId: UtilisateurId(user.id),
        }),
      { onError: QUITTER_UNE_EQUIPE_ERRORS },
    ),
  )
