'use server'

import { withAdmin, withAuth } from '@app/web/features/authentification'
import { ajouterUnMembre } from '@app/web/features/equipe/abilities/ajouter-un-membre'
import { AJOUTER_UN_MEMBRE_ERRORS } from '@app/web/features/equipe/abilities/ajouter-un-membre/action/ajouter-un-membre.errors'
import { AjouterUnMembreValidation } from '@app/web/features/equipe/abilities/ajouter-un-membre/action/ajouter-un-membre.validation'
import { CoordinateurId, UtilisateurId } from '@app/web/features/equipe/domain'
import { actionBuilder, fromResult, withInput } from '@app/web/libraries/nextjs'

export const ajouterUnMembreAction = actionBuilder()
  .use(withAuth())
  .use(withAdmin())
  .use(withInput(AjouterUnMembreValidation))
  .execute(
    fromResult(
      async ({ user, input }) =>
        ajouterUnMembre({
          utilisateurId: UtilisateurId(input.utilisateurId),
          coordinateurId: CoordinateurId(input.coordinateurId),
          auteurId: UtilisateurId(user.id),
        }),
      { onError: AJOUTER_UN_MEMBRE_ERRORS },
    ),
  )
