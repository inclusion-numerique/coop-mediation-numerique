'use server'

import { actionBuilder } from '@/configuration/nextjs'
import { withAuth } from '@/features/authentification'
import { CREER_LIEU_ACTIVITE_ERRORS } from '@/features/inscription/abilities/renseigner-lieux-activite'
import { creerLieuActivite } from '@/features/inscription/abilities/renseigner-lieux-activite/commands/creer-lieu-activite'
import {
  enregistrerLeLieuSaisi,
  mediateurFromUser,
} from '@/features/inscription/abilities/renseigner-lieux-activite/implementation'
import { UserId } from '@/features/inscription/domain'
import { CreerLieuActiviteValidation } from '@/features/lieux-activite'
import { withMaintenance } from '@/features/maintenance-mode'
import { fromResult, withInput } from '@/libraries/nextjs'

export const creerLieuActiviteAction = actionBuilder()
  .use(withAuth())
  .use(withMaintenance())
  .use(withInput(CreerLieuActiviteValidation))
  .execute(
    fromResult(
      async ({ user, input }) =>
        creerLieuActivite({
          command: { userId: UserId(user.id), saisie: input },
          mediateurFromUser,
          enregistrerLeLieuSaisi,
        }),
      { onError: CREER_LIEU_ACTIVITE_ERRORS },
    ),
  )
