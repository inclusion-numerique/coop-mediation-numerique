'use server'

import { actionBuilder } from '@/configuration/nextjs'
import { withAuth, withMediateur } from '@/features/authentification'
import { withMaintenance } from '@/features/maintenance-mode'
import { reglerLaVisibiliteCarto } from '@/features/mediateurs/abilities/regler-la-visibilite-carto'
import { REGLER_LA_VISIBILITE_CARTO_ERRORS } from '@/features/mediateurs/abilities/regler-la-visibilite-carto/action/regler-la-visibilite-carto.errors'
import { ReglerMaVisibiliteCartoValidation } from '@/features/mediateurs/abilities/regler-la-visibilite-carto/action/regler-la-visibilite-carto.validation'
import { AuteurId, MediateurId } from '@/features/mediateurs/domain'
import { synchroniserPersonne } from '@/features/registre-des-personnes'
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
