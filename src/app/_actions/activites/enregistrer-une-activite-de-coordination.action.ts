'use server'

import { actionBuilder } from '@/configuration/nextjs'
import { ENREGISTRER_UNE_ACTIVITE_DE_COORDINATION_ERRORS } from '@/features/activites/abilities/enregistrer-une-activite-de-coordination/action/enregistrer-une-activite-de-coordination.errors'
import { EnregistrerUneActiviteDeCoordinationValidation } from '@/features/activites/abilities/enregistrer-une-activite-de-coordination/action/enregistrer-une-activite-de-coordination.validation'
import { enregistrerUneActiviteDeCoordination } from '@/features/activites/abilities/enregistrer-une-activite-de-coordination/implementations/prisma/enregistrer-une-activite-de-coordination.mutation'
import { CoordinateurId, UtilisateurId } from '@/features/activites/domain'
import { tagsUtilisablesDepuis } from '@/features/activites/domain/fournisseurs-de-la-saisie'
import { profilDeLaSession } from '@/features/authentification/domain/profil-de-la-session'
import { withAuth } from '@/features/authentification/middlewares/with-auth'
import { withMaintenance } from '@/features/maintenance-mode/middlewares/with-maintenance'
import { tagsVisiblesPar } from '@/features/tags/abilities/lire-les-tags-visibles/implementations/prisma/tags-visibles-par.query'
import { acteurDe } from '@/features/tags/domain'
import { fromResult, withInput } from '@/libraries/nextjs'

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
          tagsUtilisables: tagsUtilisablesDepuis(
            tagsVisiblesPar(acteurDe(profilDeLaSession(user))),
          ),
        }),
      { onError: ENREGISTRER_UNE_ACTIVITE_DE_COORDINATION_ERRORS },
    ),
  )
