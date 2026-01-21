import {
  getMediateurFromDataspaceApi,
  isDataspaceApiError,
} from '@app/web/external-apis/dataspace/dataspaceApiClient'
import {
  type SyncChanges,
  syncFromDataspaceCore,
} from '@app/web/features/dataspace/syncFromDataspaceCore'
import { prismaClient } from '@app/web/prismaClient'

export type UpdateUserFromDataspaceResult = {
  success: boolean
  noOp: boolean
  error?: string
  changes: SyncChanges
}

/**
 * Main function to sync user's conseiller numérique and coordinateur status from Dataspace API
 *
 * Called at login to check the account's dispositif:
 * - Was Conum, still Conum → Sync structures (Dataspace = source of truth)
 * - Was Conum, no longer is → One last sync, then switch to mediateur (Local = source of truth)
 * - Was not Conum, becomes Conum → Set isConseillerNumerique = true, sync structures
 * - Was not Conum, still not → Don't touch emplois (Local = source of truth)
 * - Becomes Coordo conum → ADD Coordo role (never delete)
 * - Not found in API (null) → No-op
 *
 * Source of Truth Rules:
 * - is_conseiller_numerique: true → Dataspace is source of truth for emplois/structures
 * - is_conseiller_numerique: false → Local is source of truth, only update the flag
 *
 * Note: Lieux d'activité are NOT synced here. They are only imported once during inscription.
 */
export const updateUserFromDataspaceData = async ({
  userId,
}: {
  userId: string
}): Promise<UpdateUserFromDataspaceResult> => {
  const emptyChanges: SyncChanges = {
    conseillerNumeriqueCreated: false,
    conseillerNumeriqueRemoved: false,
    coordinateurCreated: false,
    coordinateurUpdated: false,
    structuresSynced: 0,
    structuresRemoved: 0,
  }

  // 1. Fetch user with current state
  const user = await prismaClient.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      isConseillerNumerique: true,
      coordinateur: {
        select: {
          id: true,
        },
      },
    },
  })

  if (!user) {
    return {
      success: false,
      noOp: true,
      error: 'User not found',
      changes: emptyChanges,
    }
  }

  // 2. Fetch from Dataspace API by email
  const dataspaceResult = await getMediateurFromDataspaceApi({
    email: user.email,
  })

  // Handle API errors
  if (isDataspaceApiError(dataspaceResult)) {
    return {
      success: false,
      noOp: true,
      error: dataspaceResult.error.message,
      changes: emptyChanges,
    }
  }

  // 3. Use shared core for sync logic
  const { success, noOp, changes } = await syncFromDataspaceCore({
    userId,
    dataspaceData: dataspaceResult,
    wasConseillerNumerique: user.isConseillerNumerique,
  })

  // 4. Handle coordinateurUpdated for existing coordinateur
  if (
    !changes.coordinateurCreated &&
    user.coordinateur !== null &&
    dataspaceResult?.is_coordinateur
  ) {
    changes.coordinateurUpdated = true
  }

  return {
    success,
    noOp,
    changes,
  }
}
