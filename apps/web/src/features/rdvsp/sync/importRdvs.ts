import { prismaClient } from '@app/web/prismaClient'
import {
  executeOAuthRdvApiCall,
  OAuthRdvApiCredentials,
  type OauthRdvApiResponseResult,
  oAuthRdvApiListRdvs,
  oAuthRdvApiListWebhooks,
  oAuthRdvApiGetOrganisations,
} from '@app/web/rdv-service-public/executeOAuthRdvApiCall'
import {
  getUserContextForOAuthApiCall,
  UserContextForRdvApiCall,
} from '@app/web/rdv-service-public/getUserContextForRdvApiCall'
import type {
  OAuthApiParticipation,
  OAuthApiRdv,
  OAuthApiRdvsResponse,
} from '@app/web/rdv-service-public/OAuthRdvApiCallInput'
import { dateAsIsoDay } from '@app/web/utils/dateAsIsoDay'
import { createStopwatch } from '@app/web/utils/stopwatch'
import { UserId, UserRdvAccount } from '@app/web/utils/user'
import type { Prisma, RdvAccount } from '@prisma/client'
import { v4 } from 'uuid'

const parseDate = (value: string | null): Date | null =>
  value ? new Date(value) : null

const optional = (value: string | null | undefined) => value ?? null

const isSuccessResponse = <T>(
  result: OauthRdvApiResponseResult<T>,
): result is { status: 'ok'; data: T; error: undefined } =>
  result.status === 'ok'

const fetchAllAccountDataFromRdvApi = async ({
  oAuthCallUser,
  startsAfter,
}: {
  oAuthCallUser: UserContextForRdvApiCall
  startsAfter?: string // iso day of startsAfter
}) => {
  const [rdvs, organisations, webhooks] = await Promise.all([
    oAuthRdvApiListRdvs({
      rdvAccount: oAuthCallUser.rdvAccount,
      params: {
        agent_id: oAuthCallUser.rdvAccount.id,
        starts_after: startsAfter,
      },
      onlyFirstPage: true,
    }),
    oAuthRdvApiGetOrganisations({ rdvAccount }),
    oAuthRdvApiListWebhooks({ rdvAccount }),
  ])

  return { rdvs, organisations, webhooks }
}

export const importRdvs = async ({
  user,
  mediateurId,
}: {
  user: UserRdvAccount & UserId
  mediateurId: string
}) => {
  if (!user.rdvAccount?.hasOauthTokens) {
    return null
  }
  const oAuthCallUser = await getUserContextForOAuthApiCall({ user })

  const startsAfter = rdvAccount.syncFrom
    ? dateAsIsoDay(rdvAccount.syncFrom)
    : undefined

  const syncData: Prisma.RdvSyncLogUncheckedCreateInput = {
    rdvAccountId: rdvAccount.id,
    started: new Date(),
    ended: null,
    error: null,
    log: '',
  }

  syncData.log += `Fetching data from RDV API for account ${rdvAccount.id} from ${startsAfter ?? 'all time'}\n`
  const fetchDataStart = createStopwatch()
  const { rdvs, rdvUsers, rdvAgents, rdvOrganisations, rdvMotifs } =
    await fetchAllAccountDataFromRdvApi({ oAuthCallUser, startsAfter })
  syncData.log += `Data fetching from RDV API took ${fetchDataStart.stop().duration}ms\n`
  syncData.log += `- organisations: ${rdvOrganisations.length}\n`
  syncData.log += `- motifs: ${rdvMotifs.length}\n`
  syncData.log += `- agents: ${rdvAgents.length}\n`
  syncData.log += `- rdvs: ${rdvs.length}\n`
  syncData.log += `- users: ${rdvUsers.length}\n`

  try {
    // First we fetch all the data from the external API

    const rdvs = await fetchAllAgentRdvs({ rdvAccount, startsAfter })

    const rdvUsers = new Map<number, OAuthApiParticipation['user']>()
    const rdvAgents = new Map<number, OAuthApiRdv['agents'][number]>()

    for (const rdv of rdvs) {
      for (const participation of rdv.participations) {
        rdvUsers.set(participation.user.id, participation.user)
      }

      for (const agent of rdv.agents) {
        rdvAgents.set(agent.id, agent)
      }
    }

    await prismaClient.$transaction(async (tx) => {
      for (const user of rdvUsers.values()) {
        await syncRdvUser({ tx, mediateurId, user })
      }

      for (const agent of rdvAgents.values()) {
        await syncAgent({ tx, agent })
      }

      for (const rdv of rdvs) {
        await syncOrganisationGraph({
          tx,
          rdv,
          rdvAccountId: rdvAccount.id,
        })
        await syncRdvAggregate({ tx, rdv })
      }
    })

    await prismaClient.rdvAccount.update({
      where: { id: rdvAccount.id },
      data: { lastSynced: new Date(), error: null },
    })
    syncData.ended = new Date()
  } catch (error) {
    syncData.error = error instanceof Error ? error.message : 'Unknown error'
  } finally {
    await prismaClient.rdvSyncLog.create({
      data: syncData,
    })
  }
}
