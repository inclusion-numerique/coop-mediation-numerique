'use server'

import { withAuth } from '@app/web/features/authentification'
import { CREER_LIEU_ACTIVITE_ERRORS } from '@app/web/features/inscription/abilities/renseigner-lieux-activite'
import { creerLieuActivite } from '@app/web/features/inscription/abilities/renseigner-lieux-activite/commands/creer-lieu-activite'
import { UserId } from '@app/web/features/inscription/domain'
import { CreerLieuActiviteValidation } from '@app/web/features/structures/CreerLieuActiviteValidation'
import { actionBuilder, fromResult, withInput } from '@app/web/libraries/nextjs'

export const creerLieuActiviteAction = actionBuilder()
  .use(withAuth())
  .use(withInput(CreerLieuActiviteValidation))
  .execute(
    fromResult(
      async ({ user, input }) =>
        creerLieuActivite({ userId: UserId(user.id), saisie: input }),
      { onError: CREER_LIEU_ACTIVITE_ERRORS },
    ),
  )
