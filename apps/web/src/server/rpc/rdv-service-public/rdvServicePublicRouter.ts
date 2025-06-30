import { getSessionUser } from '@app/web/auth/getSessionUser'
import {
  getSessionUserFromId,
  sessionUserSelect,
} from '@app/web/auth/getSessionUserFromSessionToken'
import { getBeneficiaireAdresseString } from '@app/web/beneficiaire/getBeneficiaireAdresseString'
import { prismaClient } from '@app/web/prismaClient'
import {
  type OauthRdvApiCreateRdvPlanInput,
  OauthRdvApiCreateRdvPlanMutationInputValidation,
} from '@app/web/rdv-service-public/OAuthRdvApiCallInput'
import {
  oAuthRdvApiCreateRdvPlan,
  oAuthRdvApiGetOrganisations,
  oAuthRdvApiMe,
} from '@app/web/rdv-service-public/executeOAuthRdvApiCall'
import { getUserContextForOAuthApiCall } from '@app/web/rdv-service-public/getUserContextForRdvApiCall'
import { refreshRdvAgentAccountData } from '@app/web/rdv-service-public/refreshRdvAgentAccountData'
import { protectedProcedure, router } from '@app/web/server/rpc/createRouter'
import { externalApiError, invalidError } from '@app/web/server/rpc/trpcErrors'
import { getServerUrl } from '@app/web/utils/baseUrl'
import { AxiosError } from 'axios'

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

      const result = await oAuthRdvApiGetOrganisations({
        rdvAccount: oAuthCallUser.rdvAccount,
      })

      if (result.status === 'error') {
        throw externalApiError(result.error)
      }

      return result.data
    },
  ),
  refreshRdvAccountData: protectedProcedure.mutation(
    async ({ ctx: { user } }) => {
      const oAuthCallUser = await getUserContextForOAuthApiCall({ user })

      const result = await refreshRdvAgentAccountData({
        rdvAccount: oAuthCallUser.rdvAccount,
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
      await transaction.rdvOrganisation.deleteMany({
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
  syncRdvAccountData: protectedProcedure.mutation(async ({ ctx: { user } }) => {
    const oAuthCallUser = await getUserContextForOAuthApiCall({ user })

    const [meResponse, organisationsResponse] = await Promise.all([
      oAuthRdvApiMe({
        rdvAccount: oAuthCallUser.rdvAccount,
      }),
      oAuthRdvApiGetOrganisations({
        rdvAccount: oAuthCallUser.rdvAccount,
      }),
    ])

    if (
      meResponse.status === 'error' ||
      organisationsResponse.status === 'error'
    ) {
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
    } else {
      await prismaClient.rdvAccount.update({
        where: {
          id: oAuthCallUser.rdvAccount.id,
        },
        data: { updated: new Date(), lastSynced: new Date(), error: null },
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
