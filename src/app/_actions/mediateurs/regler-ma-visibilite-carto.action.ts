'use server'

import { actionBuilder } from '@/configuration/nextjs'
import { withAuth } from '@/features/authentification/middlewares/with-auth'
import { withMediateur } from '@/features/authentification/middlewares/with-mediateur'
import { withMaintenance } from '@/features/maintenance-mode/middlewares/with-maintenance'
import { REGLER_LA_VISIBILITE_CARTO_ERRORS } from '@/features/mediateurs/abilities/regler-la-visibilite-carto/action/regler-la-visibilite-carto.errors'
import { ReglerMaVisibiliteCartoValidation } from '@/features/mediateurs/abilities/regler-la-visibilite-carto/action/regler-la-visibilite-carto.validation'
import { reglerLaVisibiliteCarto } from '@/features/mediateurs/abilities/regler-la-visibilite-carto/implementations/prisma/regler-la-visibilite-carto.mutation'
import { AuteurId, MediateurId } from '@/features/mediateurs/domain'
import { synchroniserPersonne } from '@/features/registre-des-personnes/implementations/prisma/registre-personne.mutation'
import { fromResult, withInput } from '@/libraries/nextjs'

export const reglerMaVisibiliteCartoAction = actionBuilder()
  .use(withAuth())
  .use(withMaintenance())
  .use(withMediateur())
  .use(withInput(ReglerMaVisibiliteCartoValidation))
  .execute(
    fromResult(
      ({ input, user, mediateur }) =>
        reglerLaVisibiliteCarto(synchroniserPersonne)({
          mediateurId: MediateurId(mediateur.id),
          visible: input.visible,
          auteurId: AuteurId(user.id),
        }),
      { onError: REGLER_LA_VISIBILITE_CARTO_ERRORS },
    ),
  )
