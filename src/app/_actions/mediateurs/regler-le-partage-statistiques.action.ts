'use server'

import { actionBuilder } from '@/configuration/nextjs'
import type { UtilisateurDeLaSession } from '@/features/authentification/domain/utilisateur-de-la-session'
import { withAuth } from '@/features/authentification/middlewares/with-auth'
import { withMaintenance } from '@/features/maintenance-mode/middlewares/with-maintenance'
import { REGLER_LE_PARTAGE_STATISTIQUES_ERRORS } from '@/features/mediateurs/abilities/regler-le-partage-statistiques/action/regler-le-partage-statistiques.errors'
import { ReglerLePartageStatistiquesValidation } from '@/features/mediateurs/abilities/regler-le-partage-statistiques/action/regler-le-partage-statistiques.validation'
import { reglerLePartageStatistiques } from '@/features/mediateurs/abilities/regler-le-partage-statistiques/implementations/prisma/regler-le-partage-statistiques.mutation'
import {
  AuteurId,
  CoordinateurId,
  MediateurId,
  type Rattachements,
} from '@/features/mediateurs/domain'
import { fromResult, withInput } from '@/libraries/nextjs'

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
      ({ input, user }) =>
        reglerLePartageStatistiques({
          rattachements: rattachementsDe(user),
          perimetre: input.perimetre,
          actif: input.actif,
          auteurId: AuteurId(user.id),
        }),
      { onError: REGLER_LE_PARTAGE_STATISTIQUES_ERRORS },
    ),
  )
