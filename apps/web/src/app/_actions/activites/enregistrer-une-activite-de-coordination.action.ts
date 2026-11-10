'use server'

import { enregistrerUneActiviteDeCoordination } from '@app/web/features/activites/abilities/enregistrer-une-activite-de-coordination'
import { ENREGISTRER_UNE_ACTIVITE_DE_COORDINATION_ERRORS } from '@app/web/features/activites/abilities/enregistrer-une-activite-de-coordination/action/enregistrer-une-activite-de-coordination.errors'
import { EnregistrerUneActiviteDeCoordinationValidation } from '@app/web/features/activites/abilities/enregistrer-une-activite-de-coordination/action/enregistrer-une-activite-de-coordination.validation'
import {
  CoordinateurId,
  UtilisateurId,
} from '@app/web/features/activites/domain'
import { withAuth } from '@app/web/features/authentification'
import { withMaintenance } from '@app/web/features/maintenance-mode'
import { actionBuilder, fromResult, withInput } from '@app/web/libraries/nextjs'
import { tagsUtilisablesPar } from './ports-de-la-saisie'

export const enregistrerUneActiviteDeCoordinationAction = actionBuilder()
  .use(withAuth())
  .use(withMaintenance())
  .use(withInput(EnregistrerUneActiviteDeCoordinationValidation))
  .execute(
    fromResult(
      async ({ user, input }) =>
        enregistrerUneActiviteDeCoordination({
          saisie: input,
          coordinateurId:
            user.coordinateur == null
              ? null
              : CoordinateurId(user.coordinateur.id),
          auteurId: UtilisateurId(user.id),
          tagsUtilisables: tagsUtilisablesPar(user),
        }),
      { onError: ENREGISTRER_UNE_ACTIVITE_DE_COORDINATION_ERRORS },
    ),
  )
