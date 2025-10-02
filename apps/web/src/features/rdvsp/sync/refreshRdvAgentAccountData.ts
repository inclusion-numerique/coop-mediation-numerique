import { prismaClient } from '@app/web/prismaClient'
import {
  OAuthRdvApiCredentials,
  oAuthRdvApiMe,
} from '@app/web/rdv-service-public/executeOAuthRdvApiCall'
import type { AppendLog } from './syncAllRdvData'

export const refreshRdvAgentAccountData = async ({
  rdvAccount,
  appendLog,
}: {
  rdvAccount: OAuthRdvApiCredentials
  appendLog: AppendLog
}) => {
  appendLog('refresh rdv account agent')
  // Get agent data to be sure that the account is still linked to the user
  const meResponse = await oAuthRdvApiMe({
    rdvAccount,
  })

  if (meResponse.status === 'error') {
    // Update was unseccesful, we don't want to update the account
    appendLog('refresh rdv account agent failed')
    return { rdvAccount }
  }

  const now = new Date()

  const updatedAccount = await prismaClient.rdvAccount.update({
    where: { id: rdvAccount.id },
    data: {
      updated: now,
      lastSynced: now,
      error: null,
    },
    include: {
      organisations: true,
    },
  })

  appendLog('refresh rdv account agent success')

  return { rdvAccount: updatedAccount }
}
