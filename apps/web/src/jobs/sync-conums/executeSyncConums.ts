import { output } from '@app/cli/output'
import { syncUsersFromDataspace } from '@app/web/features/dataspace/syncUserFromDataspace'
import { prismaClient } from '@app/web/prismaClient'
import { SyncConumsJob } from './syncConumsJob'

/**
 * Sync conseillers numériques from Dataspace API
 *
 * Iterates through users with mediateur or coordinateur in our DB
 * and calls the Dataspace API for each to sync their data.
 */
export const executeSyncConums = async (_job: SyncConumsJob) => {
  output('Syncing conseillers numériques from Dataspace API...')

  // Get all users that have a mediateur or coordinateur
  const usersToSync = await prismaClient.user.findMany({
    where: {
      OR: [
        { mediateur: { isNot: null } },
        { coordinateur: { isNot: null } },
      ],
      deleted: null,
    },
    select: {
      id: true,
      email: true,
    },
    orderBy: {
      email: 'asc',
    },
  })

  output(`Found ${usersToSync.length} users to sync`)

  const { synced, failed, notFound } = await syncUsersFromDataspace({
    users: usersToSync,
    onProgress: ({ current, total, success }) => {
      if (current % 100 === 0 || current === total) {
        output(`Progress: ${current}/${total} (${success ? 'ok' : 'failed'})`)
      }
    },
  })

  output(
    `Sync completed: ${synced} synced, ${notFound} not found in Dataspace, ${failed} failed`,
  )
}
