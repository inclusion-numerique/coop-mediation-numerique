import { getSessionUserFromId } from '@app/web/auth/getSessionUserFromSessionToken'
import { SessionUser } from '@app/web/auth/sessionUser'
import { consulterRdvsAccueil } from '@app/web/features/rdvsp/abilities/consulter-rdvs-accueil/implementation/consulter-rdvs-accueil'
import { compteDuMediateur } from '@app/web/features/rdvsp/abilities/consulter-rdvs-accueil/implementation/prisma/compte-du-mediateur.query'
import { lireDonneesAccueilRdv } from '@app/web/features/rdvsp/abilities/consulter-rdvs-accueil/implementation/prisma/donnees-accueil-rdv.query'
import { UtilisateurCoopId } from '@app/web/features/rdvsp/domain/utilisateur-coop-id'
import { syncAllRdvData } from '@app/web/features/rdvsp/sync/syncAllRdvData'
import { prismaClient } from '@app/web/prismaClient'
import { getUserContextForOAuthApiCall } from '@app/web/rdv-service-public/getUserContextForRdvApiCall'
import { protectedProcedure, router } from '@app/web/server/rpc/createRouter'
import {
  externalApiError,
  forbiddenError,
  invalidError,
} from '@app/web/server/rpc/trpcErrors'
import * as Sentry from '@sentry/nextjs'
import z from 'zod'

const getContextForSynchronization = async ({
  sessionUser,
  userId,
}: {
  sessionUser: SessionUser
  userId: string
}) => {
  if (
    sessionUser.id !== userId &&
    sessionUser.role !== 'Admin' &&
    sessionUser.role !== 'Support'
  ) {
    throw forbiddenError()
  }

  const user = await getSessionUserFromId(userId)

  if (!user.rdvAccount) {
    throw invalidError('Compte RDV Service Public introuvable')
  }

  const oAuthCallUser = await getUserContextForOAuthApiCall({ user })

  return { user: { ...user, rdvAccount: user.rdvAccount }, oAuthCallUser }
}

const handleSynchronizationError = async ({
  error,
  rdvAccountId,
}: {
  error: unknown
  rdvAccountId: number
}) => {
  Sentry.captureException(error)
  // Update the rdvAccount with sync error info
  await prismaClient.rdvAccount.update({
    where: {
      id: rdvAccountId,
    },
    data: {
      updated: new Date(),
      lastSynced: new Date(),
      error: 'Impossible de récupérer les données du compte RDV Service Public',
    },
  })
}

const consulterRdvs = consulterRdvsAccueil({
  compteDuMediateur,
  lireDonnees: lireDonneesAccueilRdv,
})

export const rdvServicePublicRouter = router({
  // `oAuthApiMe`, `oAuthApiGetOrganisations` et `refreshRdvAccountData` ont été
  // retirées : leur seul appelant était un hook de diagnostic que plus rien
  // n'importait.
  // `deleteRdvAccount` a migré vers l'ability `deconnecter-compte-rdv`, appelée
  // par la server action `app/_actions/rdvsp/deconnecter-compte-rdv.action.ts`.
  updateIncludeRdvsInActivitesList: protectedProcedure
    .input(
      z.object({
        includeRdvsInActivitesList: z.boolean(),
        rdvAccountId: z.number(),
      }),
    )
    .mutation(
      async ({
        ctx: { user },
        input: { includeRdvsInActivitesList, rdvAccountId },
      }) => {
        if (!user.rdvAccount || user.rdvAccount.id !== rdvAccountId) {
          throw invalidError('Compte RDV Service Public introuvable')
        }

        await prismaClient.rdvAccount.update({
          where: { id: user.rdvAccount.id },
          data: { includeRdvsInActivitesList },
        })
      },
    ),
  syncRdvAccountData: protectedProcedure
    .input(
      z.object({
        userId: z.string().uuid(),
      }),
    )
    .mutation(async ({ ctx: { user: sessionUser }, input: { userId } }) => {
      const { user, oAuthCallUser } = await getContextForSynchronization({
        sessionUser,
        userId,
      })

      try {
        await syncAllRdvData({
          user,
        })
      } catch (error) {
        await handleSynchronizationError({
          error,
          rdvAccountId: oAuthCallUser.rdvAccount.id,
        })
      }

      // Returns the user with the updated rdvAccount
      return getSessionUserFromId(user.id)
    }),
  // Refresh dashboard data ONLY FOR FAILED WEBHOOK INSTALLATIONS
  refreshDashboardRdvData: protectedProcedure
    .input(
      z.object({
        userId: z.string().uuid(),
      }),
    )
    .mutation(async ({ ctx: { user: sessionUser }, input: { userId } }) => {
      const { user, oAuthCallUser } = await getContextForSynchronization({
        sessionUser,
        userId,
      })

      // Only refresh dashboard if there are invalid webhook organisations
      const invalidWebhookOrganisationIds =
        user.rdvAccount?.invalidWebhookOrganisationIds

      if (
        !invalidWebhookOrganisationIds ||
        invalidWebhookOrganisationIds.length === 0
      ) {
        return { donnees: null, hasDiff: false }
      }

      let hasDiff = false
      try {
        const result = await syncAllRdvData({
          user,
          organisationIds: invalidWebhookOrganisationIds,
        })
        hasDiff = result.drift > 0
      } catch (error) {
        await handleSynchronizationError({
          error,
          rdvAccountId: oAuthCallUser.rdvAccount.id,
        })
      }

      // Le widget de l'accueil consomme la projection de l'ability : une seule
      // forme entre le rendu initial et ce rafraîchissement.
      const widget = await consulterRdvs({
        utilisateurId: UtilisateurCoopId(user.id),
        maintenant: new Date(),
      })

      return {
        donnees: widget._tag === 'donnees' ? widget.donnees : null,
        hasDiff,
      }
    }),
  // Refresh RDVS ONLY FOR FAILED WEBHOOK INSTALLATIONS
  refreshRdvData: protectedProcedure
    .input(
      z.object({
        userId: z.string().uuid(),
      }),
    )
    .mutation(async ({ ctx: { user: sessionUser }, input: { userId } }) => {
      const { user, oAuthCallUser } = await getContextForSynchronization({
        sessionUser,
        userId,
      })
      // Only refresh dashboard if there are invalid webhook organisations
      const invalidWebhookOrganisationIds =
        user.rdvAccount?.invalidWebhookOrganisationIds

      if (
        !invalidWebhookOrganisationIds ||
        invalidWebhookOrganisationIds.length === 0
      ) {
        return { syncResult: null, hasDiff: false }
      }

      let hasDiff = false
      try {
        const syncResult = await syncAllRdvData({
          user,
          organisationIds: invalidWebhookOrganisationIds,
        })
        hasDiff = syncResult.drift > 0
        return { syncResult, hasDiff }
      } catch (error) {
        await handleSynchronizationError({
          error,
          rdvAccountId: oAuthCallUser.rdvAccount.id,
        })
      }

      return null
    }),
  // `oAuthApiCreateRdvPlan` a migré vers l'ability `prendre-rendez-vous`, appelée
  // par la server action `app/_actions/rdvsp/prendre-rendez-vous.action.ts`.
  // `updateRdvStatus` a migré vers l'ability `mettre-a-jour-statut-rdv`, appelée
  // par la server action `app/_actions/rdvsp/mettre-a-jour-statut-rdv.action.ts`.
  // `createActiviteFromRdv` a migré vers l'ability `creer-activite-depuis-rdv`,
  // appelée par la server action `app/_actions/rdvsp/creer-activite-depuis-rdv.action.ts`.
})
