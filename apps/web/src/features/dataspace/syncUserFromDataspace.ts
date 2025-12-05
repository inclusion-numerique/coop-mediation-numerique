import {
  getMediateurFromDataspaceApi,
  isDataspaceApiError,
  type DataspaceMediateur,
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
 * 2. Update User.dataspaceId
 * 3. If is_coordinateur → create Coordinateur (no Mediateur - no double roles)
 * 4. If NOT is_coordinateur → create Mediateur
 * 5. If is_conseiller_numerique → create ConseillerNumerique (requires Mediateur)
 * 6. Remove ConseillerNumerique if no longer is_conseiller_numerique
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
  if (result === null) {
    // User not found in Dataspace - not a conseiller numérique
    // Remove ConseillerNumerique if it exists
    await removeConseillerNumeriqueIfExists({ userId })

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

  // 2. Update User.dataspaceId
  await prismaClient.user.update({
    where: { id: userId },
    data: { dataspaceId: dataspaceData.id },
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
    // Create Mediateur (and ConseillerNumerique if is_conseiller_numerique)
    const mediateurResult = await importMediateurFromDataspace({
      userId,
      dataspaceData,
    })
    mediateurId = mediateurResult.mediateurId
  }

  // 4. Handle ConseillerNumerique removal if no longer is_conseiller_numerique
  // (only relevant for non-coordinateurs who have a Mediateur)
  if (!dataspaceData.is_conseiller_numerique) {
    await removeConseillerNumeriqueIfExists({ userId })
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
 * Remove ConseillerNumerique linked to a user's mediateur if it exists
 */
const removeConseillerNumeriqueIfExists = async ({
  userId,
}: {
  userId: string
}) => {
  const mediateur = await prismaClient.mediateur.findUnique({
    where: { userId },
    select: { id: true, conseillerNumerique: { select: { id: true } } },
  })

  if (mediateur?.conseillerNumerique) {
    await prismaClient.conseillerNumerique.delete({
      where: { id: mediateur.conseillerNumerique.id },
    })
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

