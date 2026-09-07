'use server'

import { withAuth } from '@app/web/features/authentification'
import { CREER_LIEU_ACTIVITE_ERRORS } from '@app/web/features/inscription/abilities/renseigner-lieux-activite'
import { creerLieuActivite } from '@app/web/features/inscription/abilities/renseigner-lieux-activite/commands/creer-lieu-activite'
import {
  enregistrerLeLieuSaisi,
  mediateurFromUser,
} from '@app/web/features/inscription/abilities/renseigner-lieux-activite/implementation'
import { UserId } from '@app/web/features/inscription/domain'
import { CreerLieuActiviteValidation } from '@app/web/features/lieux-activite'
import { actionBuilder, fromResult, withInput } from '@app/web/libraries/nextjs'

export const creerLieuActiviteAction = actionBuilder()
  .use(withAuth())
  .use(withInput(CreerLieuActiviteValidation))
  .execute(
    fromResult(
      async ({ user, input }) =>
        creerLieuActivite({
          command: { userId: UserId(user.id), saisie: input },
          mediateurFromUser,
          enregistrerLeLieuSaisi,
        }),
      { onError: CREER_LIEU_ACTIVITE_ERRORS },
    ),
  )
