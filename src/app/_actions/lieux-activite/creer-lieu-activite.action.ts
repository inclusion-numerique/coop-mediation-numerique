'use server'

import { actionBuilder } from '@/configuration/nextjs'
import { withAuth } from '@/features/authentification/middlewares/with-auth'
import { CREER_LIEU_ACTIVITE_ERRORS } from '@/features/lieux-activite/abilities/creer-lieu-activite/action/creer-lieu-activite.errors'
import { nouveauLieu } from '@/features/lieux-activite/abilities/creer-lieu-activite/action/saisie-du-lieu.transfer'
import { creerLieuActivite } from '@/features/lieux-activite/abilities/creer-lieu-activite/domain/creer-lieu-activite'
import { enregistrerLieuActivite } from '@/features/lieux-activite/abilities/creer-lieu-activite/implementations/prisma/enregistrer-lieu-activite.mutation'
import { CreerLieuActiviteValidation } from '@/features/lieux-activite/action/creer-lieu-activite.validation'
import { LieuId } from '@/features/lieux-activite/domain/identifiants/lieu-id'
import { MediateurId } from '@/features/lieux-activite/domain/identifiants/mediateur-id'
import { UtilisateurId } from '@/features/lieux-activite/domain/identifiants/utilisateur-id'
import { withMaintenance } from '@/features/maintenance-mode/middlewares/with-maintenance'
import { fromResult, withInput } from '@/libraries/nextjs'
import { success } from '@/libraries/result'

export const creerUnLieuActiviteAction = actionBuilder()
  .use(withAuth())
  .use(withMaintenance())
  .use(withInput(CreerLieuActiviteValidation))
  .execute(
    fromResult(
      async ({ user, input }) => {
        const creation = await creerLieuActivite({
          enregistrer: enregistrerLieuActivite,
        })({
          lieu: nouveauLieu(
            input,
            UtilisateurId(user.id),
            new Date(),
            LieuId(crypto.randomUUID()),
          ),
          mediateurId:
            user.mediateur == null ? null : MediateurId(user.mediateur.id),
        })

        return creation.success ? success({ id: creation.data.id }) : creation
      },
      { onError: CREER_LIEU_ACTIVITE_ERRORS },
    ),
  )
