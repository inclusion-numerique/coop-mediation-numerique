'use server'

import { actionBuilder } from '@/configuration/nextjs'
import { withAuth } from '@/features/authentification/middlewares/with-auth'
import { CREER_LIEU_ACTIVITE_ERRORS } from '@/features/lieux-activite/abilities/creer-lieu-activite/action/creer-lieu-activite.errors'
import { nouveauLieu } from '@/features/lieux-activite/abilities/creer-lieu-activite/action/depuis-la-saisie'
import { creerLieuActivite } from '@/features/lieux-activite/abilities/creer-lieu-activite/implementations/prisma/creer-lieu-activite.mutation'
import { CreerLieuActiviteValidation } from '@/features/lieux-activite/domain/creation/creer-lieu-activite.validation'
import { MediateurId } from '@/features/lieux-activite/domain/identifiants/mediateur-id'
import { UserId } from '@/features/lieux-activite/domain/identifiants/utilisateur-id'
import { withMaintenance } from '@/features/maintenance-mode/middlewares/with-maintenance'
import { fromResult, withInput } from '@/libraries/nextjs'

export const creerUnLieuActiviteAction = actionBuilder()
  .use(withAuth())
  .use(withMaintenance())
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
