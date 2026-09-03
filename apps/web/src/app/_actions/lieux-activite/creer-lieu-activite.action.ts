'use server'

import { withAuth } from '@app/web/features/authentification'
import { creerLieuActivite } from '@app/web/features/lieux-activite/abilities/creer-lieu-activite'
import { CREER_LIEU_ACTIVITE_ERRORS } from '@app/web/features/lieux-activite/abilities/creer-lieu-activite/action/creer-lieu-activite.errors'
import { nouveauLieu } from '@app/web/features/lieux-activite/abilities/creer-lieu-activite/action/depuis-la-saisie'
import { MediateurId } from '@app/web/features/lieux-activite/domain/mediateur-id'
import { UserId } from '@app/web/features/lieux-activite/domain/user-id'
import { CreerLieuActiviteValidation } from '@app/web/features/structures/CreerLieuActiviteValidation'
import { actionBuilder, fromResult, withInput } from '@app/web/libraries/nextjs'

export const creerUnLieuActiviteAction = actionBuilder()
  .use(withAuth())
  .use(withInput(CreerLieuActiviteValidation))
  .execute(
    fromResult(
      async ({ user, input }) =>
        creerLieuActivite({
          lieu: nouveauLieu(input, UserId(user.id), new Date()),
          mediateurId:
            user.mediateur == null ? null : MediateurId(user.mediateur.id),
        }),
      { onError: CREER_LIEU_ACTIVITE_ERRORS },
    ),
  )
