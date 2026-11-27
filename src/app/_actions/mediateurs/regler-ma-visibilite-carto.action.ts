'use server'

import { actionBuilder } from '@/configuration/nextjs'
import { withAuth } from '@/features/authentification/middlewares/with-auth'
import { withMediateur } from '@/features/authentification/middlewares/with-mediateur'
import { withMaintenance } from '@/features/maintenance-mode/middlewares/with-maintenance'
import { REGLER_LA_VISIBILITE_CARTO_ERRORS } from '@/features/mediateurs/abilities/regler-la-visibilite-carto/action/regler-la-visibilite-carto.errors'
import { ReglerMaVisibiliteCartoValidation } from '@/features/mediateurs/abilities/regler-la-visibilite-carto/action/regler-la-visibilite-carto.validation'
import { reglerLaVisibiliteCarto } from '@/features/mediateurs/abilities/regler-la-visibilite-carto/domain/regler-la-visibilite-carto'
import { enregistrerLaVisibilite } from '@/features/mediateurs/abilities/regler-la-visibilite-carto/implementations/prisma/enregistrer-la-visibilite.mutation'
import { lireLeMediateurARegler } from '@/features/mediateurs/abilities/regler-la-visibilite-carto/implementations/prisma/mediateur-a-regler.query'
import { AuteurId, MediateurId } from '@/features/mediateurs/domain'
import { synchroniserPersonne } from '@/features/registre-des-personnes/implementations/prisma/registre-personne.mutation'
import { fromResult, withInput } from '@/libraries/nextjs'
import { success } from '@/libraries/result'

export const reglerMaVisibiliteCartoAction = actionBuilder()
  .use(withAuth())
  .use(withMaintenance())
  .use(withMediateur())
  .use(withInput(ReglerMaVisibiliteCartoValidation))
  .execute(
    fromResult(
      async ({ input, user, mediateur }) => {
        const reglage = await reglerLaVisibiliteCarto({
          lireLeMediateur: lireLeMediateurARegler,
          enregistrer: enregistrerLaVisibilite(synchroniserPersonne),
        })({
          mediateurId: MediateurId(mediateur.id),
          visible: input.visible,
          auteurId: AuteurId(user.id),
          maintenant: new Date(),
        })

        return reglage.success ? success(undefined) : reglage
      },
      { onError: REGLER_LA_VISIBILITE_CARTO_ERRORS },
    ),
  )
