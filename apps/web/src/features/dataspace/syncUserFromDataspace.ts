import {
  type DataspaceMediateur,
  getMediateurFromDataspaceApi,
  isDataspaceApiError,
} from '@app/web/external-apis/dataspace/dataspaceApiClient'
import {
  importCoordinateurFromDataspace,
  importMediateurFromDataspace,
} from '@app/web/features/dataspace/importMediateurFromDataspace'
import { prismaClient } from '@app/web/prismaClient'

export type SyncUserFromDataspaceResult = {
  success: boolean
  dataspaceId: number | null
  isConseillerNumerique: boolean
  isCoordinateur: boolean
  mediateurId: string | null
  coordinateurId: string | null
  error?: string
}

/**
 * Main helper to sync a user from Dataspace API
 *
 * For a given user:
 * 1. Fetch from Dataspace API by email
 * 2. Update User.dataspaceId and isConseillerNumerique
 * 3. If is_coordinateur → create Coordinateur
 *
 * This helper is reusable for signup, nightly sync, and manual sync.
 */
export const syncUserFromDataspace = async ({
  userId,
  email,
}: {
  userId: string
  email: string
}): Promise<SyncUserFromDataspaceResult> => {
  // 1. Fetch from Dataspace API
  const result = await getMediateurFromDataspaceApi({ email })

  // Handle API errors
  if (isDataspaceApiError(result)) {
    return {
      success: false,
      dataspaceId: null,
      isConseillerNumerique: false,
      isCoordinateur: false,
      mediateurId: null,
      coordinateurId: null,
      error: result.error.message,
    }
  }

  // Handle not found (null result)
  if (result === null || !result.is_conseiller_numerique) {
    // User not found in Dataspace - not a conseiller numérique
    // Set isConseillerNumerique to false
    await prismaClient.user.update({
      where: { id: userId },
      data: { isConseillerNumerique: false },
    })

    return {
      success: true,
      dataspaceId: null,
      isConseillerNumerique: false,
      isCoordinateur: false,
      mediateurId: null,
      coordinateurId: null,
    }
  }

  const dataspaceData: DataspaceMediateur = result

  // 2. Update User.dataspaceId and isConseillerNumerique
  await prismaClient.user.update({
    where: { id: userId },
    data: {
      dataspaceId: dataspaceData.id,
      isConseillerNumerique: dataspaceData.is_conseiller_numerique,
    },
  })

  let mediateurId: string | null = null
  let coordinateurId: string | null = null

  // 3. Either Coordinateur OR Mediateur - no double roles
  if (dataspaceData.is_coordinateur) {
    // Create Coordinateur only
    const coordinateurResult = await importCoordinateurFromDataspace({
      userId,
      dataspaceData,
    })
    coordinateurId = coordinateurResult.coordinateurId
  } else {
    // Create Mediateur
    const mediateurResult = await importMediateurFromDataspace({
      userId,
      dataspaceData,
    })
    mediateurId = mediateurResult.mediateurId
  }

  return {
    success: true,
    dataspaceId: dataspaceData.id,
    isConseillerNumerique: dataspaceData.is_conseiller_numerique,
    isCoordinateur: dataspaceData.is_coordinateur,
    mediateurId,
    coordinateurId,
  }
}

/**
 * Batch sync multiple users from Dataspace API
 * Useful for nightly sync job
 */
export const syncUsersFromDataspace = async ({
  users,
  onProgress,
}: {
  users: { id: string; email: string }[]
  onProgress?: (progress: {
    current: number
    total: number
    userId: string
    success: boolean
  }) => void
}): Promise<{
  synced: number
  failed: number
  notFound: number
  results: SyncUserFromDataspaceResult[]
}> => {
  const results: SyncUserFromDataspaceResult[] = []
  let synced = 0
  let failed = 0
  let notFound = 0

  for (const [index, user] of users.entries()) {
    const result = await syncUserFromDataspace({
      userId: user.id,
      email: user.email,
    })

    results.push(result)

    if (result.success) {
      if (result.dataspaceId !== null) {
        synced++
      } else {
        notFound++
      }
    } else {
      failed++
    }

    onProgress?.({
      current: index + 1,
      total: users.length,
      userId: user.id,
      success: result.success,
    })
  }

  return {
    synced,
    failed,
    notFound,
    results,
  }
}
