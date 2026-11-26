'use server'

import { actionBuilder } from '@/configuration/nextjs'
import { withAuth } from '@/features/authentification/middlewares/with-auth'
import { withMediateur } from '@/features/authentification/middlewares/with-mediateur'
import { withMaintenance } from '@/features/maintenance-mode/middlewares/with-maintenance'
import { CHOISIR_LA_VISIBILITE_APRES_RUPTURE_ERRORS } from '@/features/mediateurs/abilities/choisir-la-visibilite-apres-rupture/action/choisir-la-visibilite-apres-rupture.errors'
import { ChoisirLaVisibiliteApresRuptureValidation } from '@/features/mediateurs/abilities/choisir-la-visibilite-apres-rupture/action/choisir-la-visibilite-apres-rupture.validation'
import { ReponseApresRupture } from '@/features/mediateurs/abilities/choisir-la-visibilite-apres-rupture/domain'
import { choisirLaVisibiliteApresRupture } from '@/features/mediateurs/abilities/choisir-la-visibilite-apres-rupture/domain/choisir-la-visibilite-apres-rupture'
import { enregistrerLeChoix } from '@/features/mediateurs/abilities/choisir-la-visibilite-apres-rupture/implementations/prisma/enregistrer-le-choix.mutation'
import { lireMediateurEtContrats } from '@/features/mediateurs/abilities/choisir-la-visibilite-apres-rupture/implementations/prisma/mediateur-et-contrats.query'
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
        choisirLaVisibiliteApresRupture({
          lireMediateurEtContrats,
          enregistrer: enregistrerLeChoix(synchroniserPersonne),
        })({
          mediateurId: MediateurId(mediateur.id),
          reponse: ReponseApresRupture(input.reponse),
          auteurId: AuteurId(user.id),
          maintenant: new Date(),
        }),
      { onError: CHOISIR_LA_VISIBILITE_APRES_RUPTURE_ERRORS },
    ),
  )
