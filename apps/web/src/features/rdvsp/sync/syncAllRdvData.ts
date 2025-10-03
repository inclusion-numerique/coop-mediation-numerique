import { getSessionUserFromId } from '@app/web/auth/getSessionUserFromSessionToken'
import { prismaClient } from '@app/web/prismaClient'
import { getUserContextForOAuthApiCall } from '@app/web/rdv-service-public/getUserContextForRdvApiCall'
import {
  UserId,
  UserMediateur,
  UserWithExistingRdvAccount,
} from '@app/web/utils/user'
import type { Prisma } from '@prisma/client'
import { importOrganisations } from './importOrganisations'
import { importRdvs } from './importRdvs'
import { installWebhooks } from './installWebhooks'
import { refreshRdvAgentAccountData } from './refreshRdvAgentAccountData'

export type AppendLog = (log: string | string[]) => void

export const syncAllRdvData = async ({
  user,
}: {
  user: UserWithExistingRdvAccount & UserId & UserMediateur
}) => {
  const { rdvAccount } = await getUserContextForOAuthApiCall({ user })

  const syncLog: Prisma.RdvSyncLogUncheckedCreateInput = {
    rdvAccountId: rdvAccount.id,
    started: new Date(),
    ended: null,
    error: null,
    log: '',
  }
  const start = Date.now()
  const appendLog = (log: string | string[]) => {
    if (Array.isArray(log)) {
      return log.forEach(appendLog)
    }
    const time = Math.round((Date.now() - start) / 1000)
    const line = `[rdv-sync:${rdvAccount.id}][${time}s] ${log}`
    console.log(line)
    syncLog.log += line
    syncLog.log += '\n'
  }

  try {
    await refreshRdvAgentAccountData({ rdvAccount, appendLog })
    await importOrganisations({ rdvAccount, appendLog })
    const updatedRdvAccountOrganisations =
      await prismaClient.rdvAccount.findUniqueOrThrow({
        where: { id: rdvAccount.id },
        include: {
          organisations: {
            include: {
              organisation: true,
            },
          },
        },
      })
    rdvAccount.organisations = updatedRdvAccountOrganisations.organisations

    if (user.mediateur) {
      await importRdvs({
        rdvAccount,
        mediateurId: user.mediateur.id,
        user,
        appendLog,
      })
    }
    await installWebhooks({ rdvAccount, appendLog })

    await prismaClient.rdvAccount.update({
      where: { id: rdvAccount.id },
      data: {
        lastSynced: new Date(),
        error: null,
      },
    })
  } catch (error) {
    appendLog('sync failed')
    syncLog.error = error instanceof Error ? error.message : 'Unknown error'
    console.error(error)
    throw error
  } finally {
    await prismaClient.rdvSyncLog.create({
      data: syncLog,
    })
  }
}
