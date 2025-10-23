import { getSessionUserFromId } from '@app/web/auth/getSessionUserFromSessionToken'
import { getBeneficiaireAdresseString } from '@app/web/beneficiaire/getBeneficiaireAdresseString'
import { createOrMergeBeneficiairesFromRdvUsers } from '@app/web/features/rdvsp/sync/createOrMergeBeneficiaireFromRdvUsers'
import { mergeRdvUserFromRdvPlan } from '@app/web/features/rdvsp/sync/mergeRdvUserFromRdvPlan'
import { refreshRdvAgentAccountData } from '@app/web/features/rdvsp/sync/refreshRdvAgentAccountData'
import { syncAllRdvData } from '@app/web/features/rdvsp/sync/syncAllRdvData'
import { prismaClient } from '@app/web/prismaClient'
import { createCraDataFromRdv } from '@app/web/rdv-service-public/createCraDataFromRdv'
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
import {
  externalApiError,
  forbiddenError,
  invalidError,
} from '@app/web/server/rpc/trpcErrors'
import { getServerUrl } from '@app/web/utils/baseUrl'
import { encodeSerializableState } from '@app/web/utils/encodeSerializableState'
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
    // This is actually a soft delete
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

    await prismaClient.rdvAccount.update({
      where: {
        id: rdvAccount.id,
      },
      data: {
        deleted: new Date(),
        accessToken: null,
        refreshToken: null,
        expiresAt: null,
        updated: new Date(),
      },
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
  syncRdvAccountData: protectedProcedure
    .input(
      z.object({
        userId: z.string().uuid(),
      }),
    )
    .mutation(async ({ ctx: { user: sessionUser }, input: { userId } }) => {
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
          select: {
            id: true,
            prenom: true,
            nom: true,
            email: true,
            commune: true,
            adresse: true,
            mediateurId: true,
            telephone: true,
            rdvUser: {
              select: {
                id: true,
              },
            },
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
            id: beneficiaire.rdvUser?.id ?? undefined,
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

        // Extract user_id from the plan response
        const rdvPlanUserId = result.data.rdv_plan.user_id

        // Fetch user from API, create RdvUser if it doesn't exist, and link with beneficiaire
        await mergeRdvUserFromRdvPlan({
          rdvPlanUserId,
          rdvAccount: oAuthCallUser.rdvAccount,
          beneficiaire: {
            id: beneficiaireId,
            prenom: beneficiaire.prenom,
            nom: beneficiaire.nom,
            email: beneficiaire.email,
            telephone: beneficiaire.telephone,
            rdvUserId: beneficiaire.rdvUser?.id,
          },
        })

        return result.data
      },
    ),
  createActiviteFromRdv: protectedProcedure
    .input(
      z.object({
        rdvId: z.number(),
      }),
    )
    .mutation(async ({ input, ctx: { user } }) => {
      if (!user.mediateur) {
        throw forbiddenError(
          "Vous n'avez pas les permissions pour créer une activité à partir d'un RDV",
        )
      }

      // Fetching the rdv with all relevent data to create Activite and Beneficiaires
      const rdv = await prismaClient.rdv.findUnique({
        where: { id: input.rdvId },
        select: {
          id: true,
          rdvAccountId: true,
          name: true,
          durationInMin: true,
          startsAt: true,
          endsAt: true,
          maxParticipantsCount: true,
          collectif: true,
          motif: {
            select: {
              name: true,
              collectif: true,
            },
          },
          organisation: {
            select: {
              id: true,
              name: true,
            },
          },
          participations: {
            select: {
              id: true,
              status: true,
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true,
                  phoneNumber: true,
                  address: true,
                  birthDate: true,
                  beneficiaire: {
                    select: {
                      id: true,
                      prenom: true,
                      nom: true,
                      email: true,
                      telephone: true,
                      mediateurId: true,
                      adresse: true,
                      anneeNaissance: true,
                    },
                    where: {
                      mediateurId: user.mediateur.id, // Important so we don't handle shared beneficiaires
                      suppression: null, // Important so we don't link to deleted beneficiaires
                      anonyme: false, // filter out anonyme beneficiaires
                    },
                  },
                },
              },
            },
          },
        },
      })

      if (!rdv) {
        throw invalidError('RDV introuvable')
      }

      if (rdv.rdvAccountId !== user.rdvAccount?.id) {
        throw forbiddenError(
          'RDV non associé à votre compte RDV Service Public',
        )
      }

      const beneficiaires = await createOrMergeBeneficiairesFromRdvUsers({
        rdvUsers: rdv.participations
          .filter((participation) => participation.status === 'seen')
          .map((participation) => ({
            ...participation.user,
            beneficiaire: participation.user.beneficiaire.at(0) ?? null,
          })),
        mediateurId: user.mediateur.id,
      })

      const { type, defaultValues } = await createCraDataFromRdv({
        rdv,
        mediateurId: user.mediateur.id,
        beneficiaires,
      })

      const createCraUrl = getServerUrl(
        `/coop/mes-activites/cra/${type}?v=${encodeSerializableState(defaultValues)}`,
        {
          absolutePath: true,
        },
      )

      return { createCraUrl }
    }),
})
