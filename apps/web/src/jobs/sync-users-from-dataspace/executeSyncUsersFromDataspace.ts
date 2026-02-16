import { output } from '@app/cli/output'
import { updateUserFromDataspaceData } from '@app/web/features/utilisateurs/use-cases/update-from-dataspace/updateUserFromDataspaceData'
import { prismaClient } from '@app/web/prismaClient'
import type { SyncUsersFromDataspaceJob } from './syncUsersFromDataspaceJob'

/**
 * Sync all users from Dataspace API
 *
 * Iterates through all users with deleted: null and calls the
 * Dataspace API for each to sync their data using the idempotent
 * updateUserFromDataspaceData function.
 */
export const executeSyncUsersFromDataspace = async (
  _job: SyncUsersFromDataspaceJob,
) => {
  output('[dataspace sync] Syncing users from Dataspace API...')

  // Get all users that are not deleted
  const usersToSync = await prismaClient.user.findMany({
    where: {
      OR: [
        {
          // Users inscrits en v2
          inscriptionValidee: {
            not: null,
          },
          deleted: null,
        },
        {
          // Users importés de la v1
          v1Imported: { not: null },
        },
      ],
    },
    select: {
      id: true,
      email: true,
    },
    orderBy: {
      email: 'asc',
    },
  })

  output(`[dataspace sync] Found ${usersToSync.length} users to sync`)

  let synced = 0
  let failed = 0
  let noOp = 0

  // Process users sequentially
  for (const [index, user] of usersToSync.entries()) {
    try {
      const result = await updateUserFromDataspaceData({ userId: user.id })

      if (result.success) {
        if (result.noOp) {
          noOp++
        } else {
          synced++
        }
      } else {
        failed++
      }

      // Log progress every 100 users or at the end
      if ((index + 1) % 100 === 0 || index + 1 === usersToSync.length) {
        output(
          `[dataspace sync] Progress: ${index + 1}/${usersToSync.length} (synced: ${synced}, noOp: ${noOp}, failed: ${failed})`,
        )
      }
    } catch (error) {
      failed++
      output(`[dataspace sync] Error syncing user ${user.email}: ${error}`)
    }
  }

  output(
    `[dataspace sync] Sync completed: ${synced} synced, ${noOp} no changes needed, ${failed} failed`,
  )

  return {
    total: usersToSync.length,
    synced,
    noOp,
    failed,
  }
}
