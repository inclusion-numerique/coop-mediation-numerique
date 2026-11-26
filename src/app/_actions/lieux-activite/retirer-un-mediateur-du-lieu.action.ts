'use server'

import { actionBuilder } from '@/configuration/nextjs'
import { withAuth } from '@/features/authentification/middlewares/with-auth'
import { RETIRER_UN_MEDIATEUR_DU_LIEU_ERRORS } from '@/features/lieux-activite/abilities/retirer-un-mediateur-du-lieu/action/retirer-un-mediateur-du-lieu.errors'
import { RetirerUnMediateurDuLieuValidation } from '@/features/lieux-activite/abilities/retirer-un-mediateur-du-lieu/action/retirer-un-mediateur-du-lieu.validation'
import { retirerUnMediateurDuLieu } from '@/features/lieux-activite/abilities/retirer-un-mediateur-du-lieu/domain/retirer-un-mediateur-du-lieu'
import { envoyerLeRetraitDuLieu } from '@/features/lieux-activite/abilities/retirer-un-mediateur-du-lieu/implementations/email/envoyer-le-retrait-du-lieu.mutation'
import { trouverLeRattachementEnCours } from '@/features/lieux-activite/abilities/retirer-un-mediateur-du-lieu/implementations/prisma/rattachement-en-cours.query'
import { terminerLeRattachement } from '@/features/lieux-activite/abilities/retirer-un-mediateur-du-lieu/implementations/prisma/terminer-le-rattachement.mutation'
import { LieuId } from '@/features/lieux-activite/domain/identifiants/lieu-id'
import { MediateurId } from '@/features/lieux-activite/domain/identifiants/mediateur-id'
import { UtilisateurId } from '@/features/lieux-activite/domain/identifiants/utilisateur-id'
import { withMaintenance } from '@/features/maintenance-mode/middlewares/with-maintenance'
import { fromResult, withInput } from '@/libraries/nextjs'
import { success } from '@/libraries/result'

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
  .use(withMaintenance())
  .use(withInput(RetirerUnMediateurDuLieuValidation))
  .execute(
    fromResult(
      async ({ user, input }) => {
        const retrait = await retirerUnMediateurDuLieu({
          trouverLeRattachementEnCours,
          envoyerLeRetraitDuLieu,
          terminerLeRattachement,
        })({
          mediateurId: MediateurId(input.mediateurId),
          lieuId: LieuId(input.lieuId),
          auteur: {
            userId: UtilisateurId(user.id),
            mediateurId:
              user.mediateur == null ? null : MediateurId(user.mediateur.id),
            estAdministrateur: user.role === 'Admin',
            coordonneLeMediateurRetire:
              user.coordinateur?.mediateursCoordonnes.some(
                ({ mediateurId }) => mediateurId === input.mediateurId,
              ) ?? false,
            nomAffiche: nomAffiche(user),
          },
          maintenant: new Date(),
        })

        return retrait.success ? success(undefined) : retrait
      },
      { onError: RETIRER_UN_MEDIATEUR_DU_LIEU_ERRORS },
    ),
  )
