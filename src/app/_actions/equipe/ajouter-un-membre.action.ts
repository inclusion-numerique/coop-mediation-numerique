'use server'

import { actionBuilder } from '@/configuration/nextjs'
import { withAdmin } from '@/features/authentification/middlewares/with-admin'
import { withAuth } from '@/features/authentification/middlewares/with-auth'
import { AJOUTER_UN_MEMBRE_ERRORS } from '@/features/equipe/abilities/ajouter-un-membre/action/ajouter-un-membre.errors'
import { AjouterUnMembreValidation } from '@/features/equipe/abilities/ajouter-un-membre/action/ajouter-un-membre.validation'
import { ajouterUnMembre } from '@/features/equipe/abilities/ajouter-un-membre/domain/ajouter-un-membre'
import { enregistrerLAdhesion } from '@/features/equipe/abilities/ajouter-un-membre/implementations/prisma/enregistrer-l-adhesion.mutation'
import {
  coordinateurExiste,
  lireLUtilisateurAAjouter,
} from '@/features/equipe/abilities/ajouter-un-membre/implementations/prisma/utilisateur-a-ajouter.query'
import { CoordinateurId, UtilisateurId } from '@/features/equipe/domain'
import { lireLesAdhesionsDeLaPaire } from '@/features/equipe/implementations/prisma/adhesion.query'
import { fromResult, withInput } from '@/libraries/nextjs'

export const ajouterUnMembreAction = actionBuilder()
  .use(withAuth())
  .use(withAdmin())
  .use(withInput(AjouterUnMembreValidation))
  .execute(
    fromResult(
      async ({ user, input }) =>
        ajouterUnMembre({
          lireLUtilisateurAAjouter,
          coordinateurExiste,
          lireLesAdhesionsDeLaPaire,
          enregistrerLAdhesion,
        })({
          utilisateurId: UtilisateurId(input.utilisateurId),
          coordinateurId: CoordinateurId(input.coordinateurId),
          auteurId: UtilisateurId(user.id),
        }),
      { onError: AJOUTER_UN_MEMBRE_ERRORS },
    ),
  )
