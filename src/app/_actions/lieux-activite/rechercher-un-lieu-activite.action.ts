'use server'

import { actionBuilder } from '@/configuration/nextjs'
import { withAuth } from '@/features/authentification/middlewares/with-auth'
import { RechercherUnLieuActiviteValidation } from '@/features/lieux-activite/abilities/rechercher-un-lieu-activite/action/rechercher-un-lieu-activite.validation'
import { rechercherUnLieuActivite } from '@/features/lieux-activite/abilities/rechercher-un-lieu-activite/implementations/prisma/rechercher-un-lieu-activite.query'
import { MediateurId } from '@/features/lieux-activite/domain/identifiants/mediateur-id'
import { withInput } from '@/libraries/nextjs'

export const rechercherUnLieuActiviteAction = actionBuilder()
  .use(withAuth())
  .use(withInput(RechercherUnLieuActiviteValidation))
  .execute(async ({ user, input }) =>
    user.mediateur == null
      ? []
      : rechercherUnLieuActivite({
          mediateurId: MediateurId(user.mediateur.id),
          recherche: input.recherche,
        }),
  )
