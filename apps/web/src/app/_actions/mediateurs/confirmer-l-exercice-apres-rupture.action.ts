'use server'

import { withAuth, withMediateur } from '@app/web/features/authentification'
import { confirmerLExerciceApresRupture } from '@app/web/features/mediateurs/abilities/confirmer-l-exercice-apres-rupture'
import { CONFIRMER_L_EXERCICE_APRES_RUPTURE_ERRORS } from '@app/web/features/mediateurs/abilities/confirmer-l-exercice-apres-rupture/action/confirmer-l-exercice-apres-rupture.errors'
import { ConfirmerLExerciceApresRuptureValidation } from '@app/web/features/mediateurs/abilities/confirmer-l-exercice-apres-rupture/action/confirmer-l-exercice-apres-rupture.validation'
import {
  AuteurId,
  MediateurId,
  ReponseApresRupture,
} from '@app/web/features/mediateurs/abilities/confirmer-l-exercice-apres-rupture/domain'
import { actionBuilder, fromResult, withInput } from '@app/web/libraries/nextjs'

export const confirmerLExerciceApresRuptureAction = actionBuilder()
  .use(withAuth())
  .use(withMediateur())
  .use(withInput(ConfirmerLExerciceApresRuptureValidation))
  .execute(
    fromResult(
      ({ input, user, mediateur }) =>
        confirmerLExerciceApresRupture({
          mediateurId: MediateurId(mediateur.id),
          reponse: ReponseApresRupture(input.reponse),
          auteurId: AuteurId(user.id),
        }),
      { onError: CONFIRMER_L_EXERCICE_APRES_RUPTURE_ERRORS },
    ),
  )
