'use server'

import { withAuth, withMediateur } from '@app/web/features/authentification'
import { withMaintenance } from '@app/web/features/maintenance-mode'
import { choisirLaVisibiliteApresRupture } from '@app/web/features/mediateurs/abilities/choisir-la-visibilite-apres-rupture'
import { CHOISIR_LA_VISIBILITE_APRES_RUPTURE_ERRORS } from '@app/web/features/mediateurs/abilities/choisir-la-visibilite-apres-rupture/action/choisir-la-visibilite-apres-rupture.errors'
import { ChoisirLaVisibiliteApresRuptureValidation } from '@app/web/features/mediateurs/abilities/choisir-la-visibilite-apres-rupture/action/choisir-la-visibilite-apres-rupture.validation'
import { ReponseApresRupture } from '@app/web/features/mediateurs/abilities/choisir-la-visibilite-apres-rupture/domain'
import { AuteurId, MediateurId } from '@app/web/features/mediateurs/domain'
import { actionBuilder, fromResult, withInput } from '@app/web/libraries/nextjs'

export const choisirLaVisibiliteApresRuptureAction = actionBuilder()
  .use(withAuth())
  .use(withMaintenance())
  .use(withMediateur())
  .use(withInput(ChoisirLaVisibiliteApresRuptureValidation))
  .execute(
    fromResult(
      ({ input, user, mediateur }) =>
        choisirLaVisibiliteApresRupture({
          mediateurId: MediateurId(mediateur.id),
          reponse: ReponseApresRupture(input.reponse),
          auteurId: AuteurId(user.id),
        }),
      { onError: CHOISIR_LA_VISIBILITE_APRES_RUPTURE_ERRORS },
    ),
  )
