'use server'

import { withAuth } from '@app/web/features/authentification'
import { retirerUnMediateurDuLieu } from '@app/web/features/lieux-activite/abilities/retirer-un-mediateur-du-lieu'
import { RETIRER_UN_MEDIATEUR_DU_LIEU_ERRORS } from '@app/web/features/lieux-activite/abilities/retirer-un-mediateur-du-lieu/action/retirer-un-mediateur-du-lieu.errors'
import { RetirerUnMediateurDuLieuValidation } from '@app/web/features/lieux-activite/abilities/retirer-un-mediateur-du-lieu/action/retirer-un-mediateur-du-lieu.validation'
import { LieuId } from '@app/web/features/lieux-activite/domain/lieu-id'
import { MediateurId } from '@app/web/features/lieux-activite/domain/mediateur-id'
import { UserId } from '@app/web/features/lieux-activite/domain/user-id'
import { actionBuilder, fromResult, withInput } from '@app/web/libraries/nextjs'

/** Le nom sous lequel l'auteur du retrait apparaît dans l'e-mail envoyé. */
const nomAffiche = (user: {
  name: string | null
  firstName: string | null
  lastName: string | null
  email: string
}): string =>
  user.name ??
  (user.firstName && user.lastName
    ? `${user.firstName} ${user.lastName}`
    : user.email)

export const retirerUnMediateurDuLieuAction = actionBuilder()
  .use(withAuth())
  .use(withInput(RetirerUnMediateurDuLieuValidation))
  .execute(
    fromResult(
      async ({ user, input }) =>
        retirerUnMediateurDuLieu({
          mediateurId: MediateurId(input.mediateurId),
          lieuId: LieuId(input.lieuId),
          auteur: {
            userId: UserId(user.id),
            mediateurId:
              user.mediateur == null ? null : MediateurId(user.mediateur.id),
            estAdministrateur: user.role === 'Admin' || user.role === 'Support',
            estCoordinateur: user.coordinateur != null,
            nomAffiche: nomAffiche(user),
          },
        }),
      { onError: RETIRER_UN_MEDIATEUR_DU_LIEU_ERRORS },
    ),
  )
