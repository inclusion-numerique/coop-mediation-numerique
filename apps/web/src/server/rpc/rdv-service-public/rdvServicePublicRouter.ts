import { getSessionUserFromId } from '@app/web/auth/getSessionUserFromSessionToken'
import { getBeneficiaireAdresseString } from '@app/web/beneficiaire/getBeneficiaireAdresseString'
import { refreshRdvAgentAccountData } from '@app/web/features/rdvsp/sync/refreshRdvAgentAccountData'
import { syncAllRdvData } from '@app/web/features/rdvsp/sync/syncAllRdvData'
import { prismaClient } from '@app/web/prismaClient'
import {
  oAuthRdvApiCreateRdvPlan,
  oAuthRdvApiGetOrganisations,
  oAuthRdvApiMe,
} from '@app/web/rdv-service-public/executeOAuthRdvApiCall'
import { getUserContextForOAuthApiCall } from '@app/web/rdv-service-public/getUserContextForRdvApiCall'
import {
  type OauthRdvApiCreateRdvPlanInput,
  OauthRdvApiCreateRdvPlanMutationInputValidation,
} from '@app/web/rdv-service-public/OAuthRdvApiCallInput'
import { protectedProcedure, router } from '@app/web/server/rpc/createRouter'
import { externalApiError, invalidError } from '@app/web/server/rpc/trpcErrors'
import { getServerUrl } from '@app/web/utils/baseUrl'
import * as Sentry from '@sentry/nextjs'
import { AxiosError } from 'axios'
import z from 'zod'

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
  deleteRdvAccount: protectedProcedure.mutation(async ({ ctx: { user } }) => {
    const rdvAccount = await prismaClient.rdvAccount.findUnique({
      where: {
        userId: user.id,
      },
      select: {
        id: true,
      },
    })

    if (!rdvAccount) {
      throw invalidError('Compte RDV Service Public introuvable')
    }

    await prismaClient.$transaction(async (transaction) => {
      await transaction.rdvAccountOrganisation.deleteMany({
        where: {
          accountId: rdvAccount.id,
        },
      })

      await transaction.rdvAccount.delete({
        where: {
          id: rdvAccount.id,
        },
      })
    })

    return {}
  }),
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
  syncRdvAccountData: protectedProcedure.mutation(async ({ ctx: { user } }) => {
    if (!user.rdvAccount) {
      throw invalidError('Compte RDV Service Public introuvable')
    }

    const oAuthCallUser = await getUserContextForOAuthApiCall({ user })

    try {
      await syncAllRdvData({
        user: { ...user, rdvAccount: user.rdvAccount },
      })
    } catch (error) {
      Sentry.captureException(error)
      // Update the rdvAccount with sync error info
      await prismaClient.rdvAccount.update({
        where: {
          id: oAuthCallUser.rdvAccount.id,
        },
        data: {
          updated: new Date(),
          lastSynced: new Date(),
          error:
            'Impossible de récupérer les données du compte RDV Service Public',
        },
      })
    }

    // Returns the user with the updated rdvAccount
    return getSessionUserFromId(user.id)
  }),
  oAuthApiCreateRdvPlan: protectedProcedure
    .input(OauthRdvApiCreateRdvPlanMutationInputValidation)
    .mutation(
      async ({
        input: { beneficiaireId, returnUrl: _returnUrl },
        ctx: { user },
      }) => {
        const beneficiaire = await prismaClient.beneficiaire.findUnique({
          where: {
            id: beneficiaireId,
          },
        })

        if (!beneficiaire || beneficiaire.mediateurId !== user.mediateur?.id) {
          throw invalidError('Bénéficiaire introuvable')
        }

        const oAuthCallUser = await getUserContextForOAuthApiCall({ user })

        const viewBeneficiaireUrl = getServerUrl(
          `/coop/mes-beneficiaires/${beneficiaireId}/accompagnements`,
          {
            absolutePath: true,
          },
        )

        const input = {
          user: {
            id: beneficiaire.rdvServicePublicId ?? undefined,
            first_name: beneficiaire.prenom ?? undefined,
            last_name: beneficiaire.nom ?? undefined,
            email: beneficiaire.email ?? undefined,
            address: getBeneficiaireAdresseString(beneficiaire),
            phone_number: beneficiaire.telephone ?? undefined,
            // birth_date: beneficiaire.anneeNaissance // We don't have this field in the beneficiaire
          },
          return_url: viewBeneficiaireUrl,
          dossier_url: viewBeneficiaireUrl,
        } satisfies OauthRdvApiCreateRdvPlanInput

        const result = await oAuthRdvApiCreateRdvPlan({
          rdvAccount: oAuthCallUser.rdvAccount,
          input,
        })

        if (result.status === 'error') {
          throw externalApiError(result.error)
        }

        // Update beneficiaire with id from RDV Service Public if needed
        // The rest of beneficiaire data could be updated after
        // the plan is created (on redirection), to fetch email, tel, etc... if needed

        if (result.data.rdv_plan.user_id !== beneficiaire.rdvServicePublicId) {
          await prismaClient.beneficiaire.update({
            where: { id: beneficiaireId },
            data: { rdvServicePublicId: result.data.rdv_plan.user_id },
          })
        }

        return result.data
      },
    ),
})
