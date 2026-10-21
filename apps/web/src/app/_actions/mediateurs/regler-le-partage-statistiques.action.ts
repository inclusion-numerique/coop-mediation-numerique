'use server'

import type { SessionUser } from '@app/web/auth/sessionUser'
import { withAuth } from '@app/web/features/authentification'
import { reglerLePartageStatistiques } from '@app/web/features/mediateurs/abilities/regler-le-partage-statistiques'
import { REGLER_LE_PARTAGE_STATISTIQUES_ERRORS } from '@app/web/features/mediateurs/abilities/regler-le-partage-statistiques/action/regler-le-partage-statistiques.errors'
import { ReglerLePartageStatistiquesValidation } from '@app/web/features/mediateurs/abilities/regler-le-partage-statistiques/action/regler-le-partage-statistiques.validation'
import {
  AuteurId,
  CoordinateurId,
  MediateurId,
  type Rattachements,
} from '@app/web/features/mediateurs/domain'
import { actionBuilder, fromResult, withInput } from '@app/web/libraries/nextjs'

const rattachementsDe = (user: SessionUser): Rattachements => ({
  mediateurId: user.mediateur?.id ? MediateurId(user.mediateur.id) : null,
  coordinateurId: user.coordinateur?.id
    ? CoordinateurId(user.coordinateur.id)
    : null,
})

export const reglerLePartageStatistiquesAction = actionBuilder()
  .use(withAuth())
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
