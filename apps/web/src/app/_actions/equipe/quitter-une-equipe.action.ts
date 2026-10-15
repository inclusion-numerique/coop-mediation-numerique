'use server'

import { withAuth, withMediateur } from '@app/web/features/authentification'
import { quitterUneEquipe } from '@app/web/features/equipe/abilities/quitter-une-equipe'
import { QUITTER_UNE_EQUIPE_ERRORS } from '@app/web/features/equipe/abilities/quitter-une-equipe/action/quitter-une-equipe.errors'
import { QuitterUneEquipeValidation } from '@app/web/features/equipe/abilities/quitter-une-equipe/action/quitter-une-equipe.validation'
import {
  CoordinateurId,
  MediateurId,
  UtilisateurId,
} from '@app/web/features/equipe/domain'
import { actionBuilder, fromResult, withInput } from '@app/web/libraries/nextjs'

export const quitterUneEquipeAction = actionBuilder()
  .use(withAuth())
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
