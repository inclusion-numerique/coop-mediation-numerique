'use server'

import { withAuth, withMediateur } from '@app/web/features/authentification'
import { withMaintenance } from '@app/web/features/maintenance-mode'
import { reglerLaVisibiliteCarto } from '@app/web/features/mediateurs/abilities/regler-la-visibilite-carto'
import { REGLER_LA_VISIBILITE_CARTO_ERRORS } from '@app/web/features/mediateurs/abilities/regler-la-visibilite-carto/action/regler-la-visibilite-carto.errors'
import { ReglerMaVisibiliteCartoValidation } from '@app/web/features/mediateurs/abilities/regler-la-visibilite-carto/action/regler-la-visibilite-carto.validation'
import { AuteurId, MediateurId } from '@app/web/features/mediateurs/domain'
import { actionBuilder, fromResult, withInput } from '@app/web/libraries/nextjs'

export const reglerMaVisibiliteCartoAction = actionBuilder()
  .use(withAuth())
  .use(withMaintenance())
  .use(withMediateur())
  .use(withInput(ReglerMaVisibiliteCartoValidation))
  .execute(
    fromResult(
      ({ input, user, mediateur }) =>
        reglerLaVisibiliteCarto({
          mediateurId: MediateurId(mediateur.id),
          visible: input.visible,
          auteurId: AuteurId(user.id),
        }),
      { onError: REGLER_LA_VISIBILITE_CARTO_ERRORS },
    ),
  )
