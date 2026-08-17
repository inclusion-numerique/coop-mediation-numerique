import { getSessionUserFromId } from '@app/web/auth/getSessionUserFromSessionToken'
import { SessionUser } from '@app/web/auth/sessionUser'
import { getDashboardRdvData } from '@app/web/features/rdvsp/queries/getDashboardRdvData'
import { refreshRdvAgentAccountData } from '@app/web/features/rdvsp/sync/refreshRdvAgentAccountData'
import { syncAllRdvData } from '@app/web/features/rdvsp/sync/syncAllRdvData'
import { prismaClient } from '@app/web/prismaClient'
import {
  oAuthRdvApiGetOrganisations,
  oAuthRdvApiMe,
} from '@app/web/rdv-service-public/executeOAuthRdvApiCall'
import { getUserContextForOAuthApiCall } from '@app/web/rdv-service-public/getUserContextForRdvApiCall'
import { protectedProcedure, router } from '@app/web/server/rpc/createRouter'
import {
  externalApiError,
  forbiddenError,
  invalidError,
} from '@app/web/server/rpc/trpcErrors'
import * as Sentry from '@sentry/nextjs'
import { AxiosError } from 'axios'
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

export const rdvServicePublicRouter = router({
  oAuthApiMe: protectedProcedure.mutation(async ({ ctx: { user } }) => {
    const oAuthCallUser = await getUserContextForOAuthApiCall({ user })

    const result = await oAuthRdvApiMe({
      rdvAccount: oAuthCallUser.rdvAccount,
    })

    if (result.status === 'error') {
      throw externalApiError(result.error)
    }

    return result.data
  }),
  oAuthApiGetOrganisations: protectedProcedure.mutation(
    async ({ ctx: { user } }) => {
      const oAuthCallUser = await getUserContextForOAuthApiCall({ user })

      try {
        const result = await oAuthRdvApiGetOrganisations({
          rdvAccount: oAuthCallUser.rdvAccount,
        })
        return result.organisations
      } catch (error) {
        if (error instanceof AxiosError) {
          throw externalApiError(error.message)
        }
        Sentry.captureException(error)
        throw externalApiError(
          "Une erreur est survenue lors de l'appel à l'API RDV Service Public",
        )
      }
    },
  ),
  refreshRdvAccountData: protectedProcedure.mutation(
    async ({ ctx: { user } }) => {
      const oAuthCallUser = await getUserContextForOAuthApiCall({ user })

      const result = await refreshRdvAgentAccountData({
        rdvAccount: oAuthCallUser.rdvAccount,
        appendLog: () => {
          // no-op
        },
      })

      return result
    },
  ),
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
        return {
          dashboardRdvData: null,
          hasDiff: false,
        }
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

      const dashboardRdvData = await getDashboardRdvData({
        user,
      })
      return { dashboardRdvData, hasDiff }
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
        return {
          dashboardRdvData: null,
          hasDiff: false,
        }
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
