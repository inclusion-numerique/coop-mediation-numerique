'use server'

import { actionBuilder } from '@/configuration/nextjs'
import { getSessionUser } from '@/features/authentification/middlewares/with-utilisateur-de-la-session'
import { REFUSER_UNE_INVITATION_ERRORS } from '@/features/equipe/abilities/refuser-une-invitation/action/refuser-une-invitation.errors'
import { RefuserUneInvitationValidation } from '@/features/equipe/abilities/refuser-une-invitation/action/refuser-une-invitation.validation'
import { refuserUneInvitation } from '@/features/equipe/abilities/refuser-une-invitation/domain/refuser-une-invitation'
import { enregistrerLeRefus } from '@/features/equipe/abilities/refuser-une-invitation/implementations/prisma/enregistrer-le-refus.mutation'
import {
  CoordinateurId,
  Courriel,
  ReferenceInvitation,
  UtilisateurId,
} from '@/features/equipe/domain'
import { prevenirLeCoordinateur } from '@/features/equipe/implementations/email'
import { lireLeCoordinateur } from '@/features/equipe/implementations/prisma/coordinateur.query'
import { lireUneInvitation } from '@/features/equipe/implementations/prisma/invitation.query'
import { fromResult, withInput } from '@/libraries/nextjs'
import { success } from '@/libraries/result'

export const refuserUneInvitationAction = actionBuilder()
  .use(withInput(RefuserUneInvitationValidation))
  .execute(
    fromResult(
      async ({ input }) => {
        const user = await getSessionUser()
        const refus = await refuserUneInvitation({
          lireUneInvitation,
          enregistrerLeRefus,
          lireLeCoordinateur,
          prevenirLeCoordinateur,
        })({
          reference: ReferenceInvitation({
            email: Courriel(input.email),
            coordinateurId: CoordinateurId(input.coordinateurId),
          }),
          auteurId: user == null ? null : UtilisateurId(user.id),
          maintenant: new Date(),
        })
        return refus.success ? success(undefined) : refus
      },
      { onError: REFUSER_UNE_INVITATION_ERRORS },
    ),
  )
