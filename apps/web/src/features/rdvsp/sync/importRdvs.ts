import { prismaClient } from '@app/web/prismaClient'
import {
  executeOAuthRdvApiCall,
  OAuthRdvApiCredentials,
  OAuthRdvApiCredentialsWithId,
  type OauthRdvApiResponseResult,
  oAuthRdvApiGetOrganisations,
  oAuthRdvApiListRdvs,
  oAuthRdvApiListWebhooks,
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
import {
  UserId,
  UserRdvAccount,
  UserWithExistingRdvAccount,
} from '@app/web/utils/user'
import type { Prisma, RdvAccount } from '@prisma/client'
import { v4 } from 'uuid'
import { AppendLog } from './syncAllRdvData'
import { chunk } from 'lodash-es'

const findExistingRdvs = async ({
  rdvIds,
}: {
  rdvIds: Pick<OAuthApiRdv, 'id'>[]
}) => {
  return await prismaClient.rdv.findMany({
    where: {
      id: { in: rdvIds.map((rdv) => rdv.id) },
    },
    include: {
      organisation: true,
      lieu: true,
      participations: {
        include: {
          user: true,
          agent: true,
        },
      },
    },
  })
}
type ExistingRdv = Awaited<ReturnType<typeof findExistingRdvs>>[number]

// TODO more checks
const hasDiff = (existing: ExistingRdv, rdv: OAuthApiRdv) => {
  return existing.status !== rdv.status
}

const importRdv = async ({
  rdv,
  appendLog,
  existing,
}: {
  rdv: OAuthApiRdv
  existing?: ExistingRdv
  appendLog: AppendLog
}) => {
  if (existing) {
    if (!hasDiff(existing, rdv)) {
      // No diff, no need to import
      appendLog(`no diff for rdv ${rdv.id}, skipping`)
      return
    }

    // Diff, delete the aggregate root (associated data), and update the aggregate root and re-create associated data
    appendLog(`existing rdv ${rdv.id}, updating data`)
    await prismaClient.$transaction(async (tx) => {
      await tx.rdvParticipation.deleteMany({
        where: {
          rdvId: existing.id,
        },
      })
      await tx.rdv.update({
        where: {
          id: existing.id,
        },
        data: {
          status: rdv.status,
        },
      })

      await tx.rdvParticipation.createMany({
        data: rdv.participations.map((participation) => ({
          rdvId: existing.id,
          userId: participation.user.id,
          agentId: participation.agent.id,
        })),
      })
    })

    return
  }

  // Not existing, create the aggregate root and associated data
  appendLog(`importing rdv ${rdv.id}`)
  await prismaClient.$transaction(async (tx) => {
    await tx.rdv.create({
      data: rdv,
    })
    await tx.rdvParticipation.createMany({
      data: rdv.participations.map((participation) => ({
        rdvId: existing.id,
        userId: participation.user.id,
        agentId: participation.agent.id,
      })),
    })
  })
}

export const importRdvs = async ({
  user,
  mediateurId,
  rdvAccount,
  appendLog,
  batchSize = 250,
}: {
  user: UserId & UserWithExistingRdvAccount
  rdvAccount: OAuthRdvApiCredentialsWithId
  mediateurId: string
  appendLog: AppendLog
  batchSize?: number
}) => {
  appendLog('import rdvs')
  const startsAfter = user.rdvAccount.syncFrom
    ? dateAsIsoDay(new Date(user.rdvAccount.syncFrom))
    : undefined

  appendLog(
    `fetching rdvs for account ${rdvAccount.id} from ${startsAfter ?? 'all time'}`,
  )

  const { rdvs: allRdvs } = await oAuthRdvApiListRdvs({
    rdvAccount,
    params: {
      agent_id: rdvAccount.id,
      starts_after: startsAfter,
    },
    onlyFirstPage: true,
  })

  appendLog(`fetched ${allRdvs.length} rdvs from RDV API`)

  // We filter out the rdvs that have multiple agents and NOT the current agent as the first [0] one
  const rdvs = allRdvs.filter((rdv) => rdv.agents.at(0)?.id === rdvAccount.id)
  appendLog(`kept ${rdvs.length} rdvs assigned first to the current agent`)
  const chunks = chunk(rdvs, batchSize)
  appendLog(`importing ${chunks.length} chunks of ${batchSize} rdvs`)

  for (const chunkIndex in chunks) {
    appendLog(`importing chunk ${chunkIndex} of ${chunks.length} rdvs`)
    const chunkRdvs = chunks[chunkIndex]
    const existingRdvs = await findExistingRdvs({
      rdvIds: chunkRdvsv.id),
      rdvAccount,
    })
    const existingRdvsMap = new Map(existingRdvs.map((rdv) => [rdv.id, rdv]))

    await Promise.all(
      chunkRdvs.map(async (rdv) => {
        await importRdv({
          rdv,
          appendLog,
          existing: existingRdvsMap.get(rdv.id),
        })
      }),
    )
  }
}
