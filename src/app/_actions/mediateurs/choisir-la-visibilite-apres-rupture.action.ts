'use server'

import { actionBuilder } from '@/configuration/nextjs'
import { withAuth } from '@/features/authentification/middlewares/with-auth'
import { withMediateur } from '@/features/authentification/middlewares/with-mediateur'
import { withMaintenance } from '@/features/maintenance-mode/middlewares/with-maintenance'
import { CHOISIR_LA_VISIBILITE_APRES_RUPTURE_ERRORS } from '@/features/mediateurs/abilities/choisir-la-visibilite-apres-rupture/action/choisir-la-visibilite-apres-rupture.errors'
import { ChoisirLaVisibiliteApresRuptureValidation } from '@/features/mediateurs/abilities/choisir-la-visibilite-apres-rupture/action/choisir-la-visibilite-apres-rupture.validation'
import { ReponseApresRupture } from '@/features/mediateurs/abilities/choisir-la-visibilite-apres-rupture/domain'
import { choisirLaVisibiliteApresRupture } from '@/features/mediateurs/abilities/choisir-la-visibilite-apres-rupture/implementations/prisma/choisir-la-visibilite-apres-rupture.mutation'
import { AuteurId, MediateurId } from '@/features/mediateurs/domain'
import { synchroniserPersonne } from '@/features/registre-des-personnes/implementations/prisma/registre-personne.mutation'
import { fromResult, withInput } from '@/libraries/nextjs'

export const choisirLaVisibiliteApresRuptureAction = actionBuilder()
  .use(withAuth())
  .use(withMaintenance())
  .use(withMediateur())
  .use(withInput(ChoisirLaVisibiliteApresRuptureValidation))
  .execute(
    fromResult(
      ({ input, user, mediateur }) =>
        choisirLaVisibiliteApresRupture(synchroniserPersonne)({
          mediateurId: MediateurId(mediateur.id),
          reponse: ReponseApresRupture(input.reponse),
          auteurId: AuteurId(user.id),
        }),
      { onError: CHOISIR_LA_VISIBILITE_APRES_RUPTURE_ERRORS },
    ),
  )
