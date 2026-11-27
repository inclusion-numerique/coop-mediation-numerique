'use server'

import { actionBuilder } from '@/configuration/nextjs'
import { withAdmin } from '@/features/authentification/middlewares/with-admin'
import { withAuth } from '@/features/authentification/middlewares/with-auth'
import { REGLER_LA_VISIBILITE_CARTO_ERRORS } from '@/features/mediateurs/abilities/regler-la-visibilite-carto/action/regler-la-visibilite-carto.errors'
import { ReglerLaVisibiliteCartoValidation } from '@/features/mediateurs/abilities/regler-la-visibilite-carto/action/regler-la-visibilite-carto.validation'
import { reglerLaVisibiliteCarto } from '@/features/mediateurs/abilities/regler-la-visibilite-carto/domain/regler-la-visibilite-carto'
import { enregistrerLaVisibilite } from '@/features/mediateurs/abilities/regler-la-visibilite-carto/implementations/prisma/enregistrer-la-visibilite.mutation'
import { lireLeMediateurARegler } from '@/features/mediateurs/abilities/regler-la-visibilite-carto/implementations/prisma/mediateur-a-regler.query'
import { AuteurId, MediateurId } from '@/features/mediateurs/domain'
import { synchroniserPersonne } from '@/features/registre-des-personnes/implementations/prisma/registre-personne.mutation'
import { fromResult, withInput } from '@/libraries/nextjs'
import { success } from '@/libraries/result'

export const reglerLaVisibiliteCartoAction = actionBuilder()
  .use(withAuth())
  .use(withAdmin())
  .use(withInput(ReglerLaVisibiliteCartoValidation))
  .execute(
    fromResult(
      async ({ input, user }) => {
        const reglage = await reglerLaVisibiliteCarto({
          lireLeMediateur: lireLeMediateurARegler,
          enregistrer: enregistrerLaVisibilite(synchroniserPersonne),
        })({
          mediateurId: MediateurId(input.mediateurId),
          visible: input.visible,
          auteurId: AuteurId(user.id),
          maintenant: new Date(),
        })

        return reglage.success ? success(undefined) : reglage
      },
      { onError: REGLER_LA_VISIBILITE_CARTO_ERRORS },
    ),
  )
