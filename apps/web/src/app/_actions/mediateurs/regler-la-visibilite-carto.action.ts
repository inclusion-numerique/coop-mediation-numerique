'use server'

import { withAdmin, withAuth } from '@app/web/features/authentification'
import { reglerLaVisibiliteCarto } from '@app/web/features/mediateurs/abilities/regler-la-visibilite-carto'
import { REGLER_LA_VISIBILITE_CARTO_ERRORS } from '@app/web/features/mediateurs/abilities/regler-la-visibilite-carto/action/regler-la-visibilite-carto.errors'
import { ReglerLaVisibiliteCartoValidation } from '@app/web/features/mediateurs/abilities/regler-la-visibilite-carto/action/regler-la-visibilite-carto.validation'
import {
  AuteurId,
  MediateurId,
} from '@app/web/features/mediateurs/abilities/regler-la-visibilite-carto/domain'
import { actionBuilder, fromResult, withInput } from '@app/web/libraries/nextjs'

export const reglerLaVisibiliteCartoAction = actionBuilder()
  .use(withAuth())
  .use(withAdmin())
  .use(withInput(ReglerLaVisibiliteCartoValidation))
  .execute(
    fromResult(
      ({ input, user }) =>
        reglerLaVisibiliteCarto({
          mediateurId: MediateurId(input.mediateurId),
          visible: input.visible,
          auteurId: AuteurId(user.id),
        }),
      { onError: REGLER_LA_VISIBILITE_CARTO_ERRORS },
    ),
  )
