'use server'

import { withAuth } from '@app/web/features/authentification'
import { supprimerUnAncienMembre } from '@app/web/features/equipe/abilities/supprimer-un-ancien-membre'
import { SUPPRIMER_UN_ANCIEN_MEMBRE_ERRORS } from '@app/web/features/equipe/abilities/supprimer-un-ancien-membre/action/supprimer-un-ancien-membre.errors'
import { SupprimerUnAncienMembreValidation } from '@app/web/features/equipe/abilities/supprimer-un-ancien-membre/action/supprimer-un-ancien-membre.validation'
import {
  CoordinateurId,
  MediateurId,
  UtilisateurId,
} from '@app/web/features/equipe/domain'
import { gestionnaireDe } from '@app/web/features/equipe/implementation/session'
import { actionBuilder, fromResult, withInput } from '@app/web/libraries/nextjs'

export const supprimerUnAncienMembreAction = actionBuilder()
  .use(withAuth())
  .use(withInput(SupprimerUnAncienMembreValidation))
  .execute(
    fromResult(
      async ({ user, input }) =>
        supprimerUnAncienMembre({
          mediateurId: MediateurId(input.mediateurId),
          coordinateurId: CoordinateurId(input.coordinateurId),
          gestionnaire: gestionnaireDe(user),
          auteurId: UtilisateurId(user.id),
        }),
      { onError: SUPPRIMER_UN_ANCIEN_MEMBRE_ERRORS },
    ),
  )
