'use server'

import { actionBuilder } from '@/configuration/nextjs'
import type { UtilisateurDeLaSession } from '@/features/authentification/domain/utilisateur-de-la-session'
import { withAuth } from '@/features/authentification/middlewares/with-auth'
import { withMaintenance } from '@/features/maintenance-mode/middlewares/with-maintenance'
import { REGLER_LE_PARTAGE_STATISTIQUES_ERRORS } from '@/features/mediateurs/abilities/regler-le-partage-statistiques/action/regler-le-partage-statistiques.errors'
import { ReglerLePartageStatistiquesValidation } from '@/features/mediateurs/abilities/regler-le-partage-statistiques/action/regler-le-partage-statistiques.validation'
import { reglerLePartageStatistiques } from '@/features/mediateurs/abilities/regler-le-partage-statistiques/domain/regler-le-partage-statistiques'
import { enregistrerLeReglageDuPartage } from '@/features/mediateurs/abilities/regler-le-partage-statistiques/implementations/prisma/regler-le-partage-statistiques.mutation'
import {
  AuteurId,
  CoordinateurId,
  MediateurId,
  type Rattachements,
} from '@/features/mediateurs/domain'
import { fromResult, withInput } from '@/libraries/nextjs'
import { success } from '@/libraries/result'

const rattachementsDe = (user: UtilisateurDeLaSession): Rattachements => ({
  mediateurId: user.mediateur?.id ? MediateurId(user.mediateur.id) : null,
  coordinateurId: user.coordinateur?.id
    ? CoordinateurId(user.coordinateur.id)
    : null,
})

export const reglerLePartageStatistiquesAction = actionBuilder()
  .use(withAuth())
  .use(withMaintenance())
  .use(withInput(ReglerLePartageStatistiquesValidation))
  .execute(
    fromResult(
      async ({ input, user }) => {
        const reglage = await reglerLePartageStatistiques({
          enregistrer: enregistrerLeReglageDuPartage,
        })({
          rattachements: rattachementsDe(user),
          perimetre: input.perimetre,
          actif: input.actif,
          auteurId: AuteurId(user.id),
          maintenant: new Date(),
        })

        return reglage.success ? success(undefined) : reglage
      },
      { onError: REGLER_LE_PARTAGE_STATISTIQUES_ERRORS },
    ),
  )
