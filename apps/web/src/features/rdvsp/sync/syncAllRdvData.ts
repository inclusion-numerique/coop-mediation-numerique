import { getSessionUserFromId } from '@app/web/auth/getSessionUserFromSessionToken'
import {
  UserId,
  UserMediateur,
  UserWithExistingRdvAccount,
} from '@app/web/utils/user'
import { refreshRdvAgentAccountData } from './refreshRdvAgentAccountData'
import { importOrganisations } from './importOrganisations'
import { importRdvs } from './importRdvs'
import { installWebhooks } from './installWebhooks'
import { getUserContextForOAuthApiCall } from '@app/web/rdv-service-public/getUserContextForRdvApiCall'
import { prismaClient } from '@app/web/prismaClient'
import { UserWithExistingMediateur } from '@app/web/utils/user'
import type { Prisma } from '@prisma/client'

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
    syncLog.log += `[rdv-sync:${rdvAccount.id}][${(Date.now() - start) / 1000}s]`
    syncLog.log += log
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
  } catch (error) {
    syncLog.error = error instanceof Error ? error.message : 'Unknown error'
  } finally {
    const createdSyncLog = await prismaClient.rdvSyncLog.create({
      data: syncLog,
    })
    return createdSyncLog
  }
}
