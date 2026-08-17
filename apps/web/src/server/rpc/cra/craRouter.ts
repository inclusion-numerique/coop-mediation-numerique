import { CraAnimationValidation } from '@app/web/features/activites/use-cases/cra/animation/validation/CraAnimationValidation'
import { CraCollectifServerValidation } from '@app/web/features/activites/use-cases/cra/collectif/validation/CraCollectifServerValidation'
import { createOrUpdateActivite } from '@app/web/features/activites/use-cases/cra/db/createOrUpdateActivite'
import { createOrUpdateActiviteCoordination } from '@app/web/features/activites/use-cases/cra/db/createOrUpdateActiviteCoordination'
import { deleteActivite } from '@app/web/features/activites/use-cases/cra/db/deleteActivite'
import { CraEvenementValidation } from '@app/web/features/activites/use-cases/cra/evenement/validation/CraEvenementValidation'
import { CraIndividuelServerValidation } from '@app/web/features/activites/use-cases/cra/individuel/validation/CraIndividuelServerValidation'
import { CraPartenariatValidation } from '@app/web/features/activites/use-cases/cra/partenariat/validation/CraPartenariatValidation'
import { mettreAJourStatutRdv } from '@app/web/features/rdvsp/abilities/mettre-a-jour-statut-rdv/implementation/mettre-a-jour-statut-rdv'
import { contexteMiseAJourStatut } from '@app/web/features/rdvsp/abilities/mettre-a-jour-statut-rdv/implementation/prisma/contexte-mise-a-jour-statut.query'
import { enregistrerStatutRdv } from '@app/web/features/rdvsp/abilities/mettre-a-jour-statut-rdv/implementation/prisma/enregistrer-statut-rdv.mutation'
import { RdvId } from '@app/web/features/rdvsp/domain/rdv-id'
import { StatutPresenceModifiable } from '@app/web/features/rdvsp/domain/statut-presence'
import { UtilisateurCoopId } from '@app/web/features/rdvsp/domain/utilisateur-coop-id'
import { rdvServicePublicApiBinding } from '@app/web/features/rdvsp/implementation/rdv-service-public.bindings'
import { prismaClient } from '@app/web/prismaClient'
import { protectedProcedure, router } from '@app/web/server/rpc/createRouter'
import { enforceIsCoordinateur } from '@app/web/server/rpc/enforceIsCoordinateur'
import { enforceIsMediateur } from '@app/web/server/rpc/enforceIsMediateur'
import { forbiddenError, invalidError } from '@app/web/server/rpc/trpcErrors'
import { addMutationLog } from '@app/web/utils/addMutationLog'
import { onlyDefinedAndNotNull } from '@app/web/utils/onlyDefinedAndNotNull'
import { createStopwatch } from '@app/web/utils/stopwatch'
import * as Sentry from '@sentry/nextjs'
import { AxiosError } from 'axios'
import z from 'zod'

const mettreAJourStatut = mettreAJourStatutRdv({
  contexte: contexteMiseAJourStatut,
  changerStatutRdv: rdvServicePublicApiBinding.changerStatutRdv,
  enregistrer: enregistrerStatutRdv,
})

/**
 * Un compte rendu d'activité vaut constat de présence : le rendez-vous dont il
 * est issu passe à « honoré ».
 *
 * L'échec ne remonte pas — un CRA enregistré ne doit pas être perdu parce que
 * RDV Service Public est injoignable. Le passage par l'ability change deux
 * choses par rapport à l'appel direct qu'il remplace : l'appartenance du
 * rendez-vous est vérifiée, et le statut confirmé est écrit en base au lieu
 * d'attendre le webhook.
 */
const marquerRdvCommeHonore = async ({
  utilisateurId,
  rdvId,
}: {
  utilisateurId: string
  rdvId?: number | null
}): Promise<void> => {
  if (!rdvId) {
    return
  }

  const resultat = await mettreAJourStatut({
    utilisateurId: UtilisateurCoopId(utilisateurId),
    rdvId: RdvId(rdvId),
    statut: StatutPresenceModifiable('seen'),
  }).catch((erreur: unknown) => {
    Sentry.captureException?.(erreur)
    return null
  })

  if (resultat && !resultat.success) {
    Sentry.captureException?.(
      new Error(
        `Statut du rendez-vous ${rdvId} non mis à jour (${resultat.error._tag})`,
      ),
    )
  }
}

export const craRouter = router({
  individuel: protectedProcedure
    .input(CraIndividuelServerValidation)
    .mutation(async ({ input, ctx: { user } }) => {
      enforceIsMediateur(user)

      const createResult = await createOrUpdateActivite({
        input: {
          type: 'Individuel',
          data: input,
        },
        sessionUserId: user.id,
        mediateurId: user.mediateur.id,
        mediateurUserId: user.id,
      })

      await marquerRdvCommeHonore({
        utilisateurId: user.id,
        rdvId: input.rdvServicePublicId,
      })

      return createResult
    }),
  collectif: protectedProcedure
    .input(CraCollectifServerValidation)
    .mutation(async ({ input, ctx: { user } }) => {
      enforceIsMediateur(user)

      const createResult = await createOrUpdateActivite({
        input: {
          type: 'Collectif',
          data: input,
        },
        sessionUserId: user.id,
        mediateurId: user.mediateur.id,
        mediateurUserId: user.id,
      })

      await marquerRdvCommeHonore({
        utilisateurId: user.id,
        rdvId: input.rdvServicePublicId,
      })

      return createResult
    }),
  animation: protectedProcedure
    .input(CraAnimationValidation)
    .mutation(async ({ input, ctx: { user } }) => {
      enforceIsCoordinateur(user)

      return createOrUpdateActiviteCoordination({
        input: {
          type: 'Animation',
          data: input,
        },
        userId: user.id,
        coordinateurId: user.coordinateur.id,
      })
    }),
  evenement: protectedProcedure
    .input(CraEvenementValidation)
    .mutation(async ({ input, ctx: { user } }) => {
      enforceIsCoordinateur(user)

      return createOrUpdateActiviteCoordination({
        input: {
          type: 'Evenement',
          data: input,
        },
        userId: user.id,
        coordinateurId: user.coordinateur.id,
      })
    }),
  partenariat: protectedProcedure
    .input(CraPartenariatValidation)
    .mutation(async ({ input, ctx: { user } }) => {
      enforceIsCoordinateur(user)

      return createOrUpdateActiviteCoordination({
        input: {
          type: 'Partenariat',
          data: input,
        },
        userId: user.id,
        coordinateurId: user.coordinateur.id,
      })
    }),
  deleteActivite: protectedProcedure
    .input(
      z.object({
        activiteId: z.string().uuid(),
      }),
    )
    .mutation(async ({ input: { activiteId }, ctx: { user } }) => {
      enforceIsMediateur(user)

      return deleteActivite({
        activiteId,
        sessionUserId: user.id,
        mediateurId: user.mediateur.id,
      })
    }),
  deleteActiviteCoordination: protectedProcedure
    .input(
      z.object({
        activiteId: z.string().uuid(),
      }),
    )
    .mutation(async ({ input: { activiteId }, ctx: { user } }) => {
      enforceIsCoordinateur(user)

      const stopwatch = createStopwatch()

      const activite = await prismaClient.activiteCoordination.findUnique({
        where: { id: activiteId, suppression: null },
      })

      if (!activite) {
        throw invalidError('Cra not found')
      }

      if (activite.coordinateurId !== user.coordinateur.id) {
        throw forbiddenError('Cannot delete CRA for another coordinateur')
      }

      const now = new Date()

      await prismaClient.$transaction(
        [
          prismaClient.activitesCoordinationTags.deleteMany({
            where: {
              activiteCoordinationId: activiteId,
            },
          }),
          prismaClient.activiteCoordination.update({
            where: { id: activiteId },
            data: { suppression: now, modification: now },
          }),
        ].filter(onlyDefinedAndNotNull),
      )

      addMutationLog({
        userId: user.id,
        nom: 'SupprimerActiviteCoordination',
        duration: stopwatch.stop().duration,
        data: {
          type: activite.type,
          id: activiteId,
        },
      })

      return true
    }),
})
