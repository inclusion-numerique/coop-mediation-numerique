import { sessionUserSelect } from '@app/web/auth/getSessionUserFromSessionToken'
import { sessionUserHasStructureEmployeuse } from '@app/web/auth/sessionUser'
import {
  getMediateurFromDataspaceApi,
  isDataspaceApiError,
} from '@app/web/external-apis/dataspace/dataspaceApiClient'
import { syncFromDataspaceCore } from '@app/web/features/dataspace/syncFromDataspaceCore'
import { updateUserInscriptionProfileFromDataspace } from '@app/web/features/dataspace/updateUserInscriptionProfileFromDataspace'
import { importStructureEmployeuseFromSiret } from '@app/web/features/structures/importStructureEmployeuseFromSiret'
import { prismaClient } from '@app/web/prismaClient'
import { getNextInscriptionStep, getStepPath } from '../../inscriptionFlow'

export type InitializeInscriptionResult = {
  nextStepPath: string | null
}

const debugStructureEmployeuseCreation = true

// Debug logger type for tracking structure employeuse creation flow
export type InitializeDebugLogger = (
  message: string,
  ...rest: unknown[]
) => void

const createDebugLogger = (enabled: boolean): InitializeDebugLogger => {
  if (!enabled) {
    return () => {
      // Intentional no-op when debug is disabled
    }
  }
  return (message: string, ...rest: unknown[]) => {
    // biome-ignore lint/suspicious/noConsole: Intentional debug logging
    console.log(`[initialize] ${message}`, ...rest)
  }
}

/**
 * Initialize inscription for a user
 *
 * This function uses the shared syncFromDataspaceCore for idempotent sync:
 * - Coordinateur: Only created if is_coordinateur is true (never deleted)
 * - Mediateur: Only created if lieux_activite exists (never deleted)
 * - Structures employeuses: Only synced if is_conseiller_numerique is true
 *
 * For users not in Dataspace, falls back to SIRET-based structure import.
 */
export const initializeInscription = async ({
  userId,
  email,
}: {
  userId: string
  email: string
}): Promise<InitializeInscriptionResult> => {
  const log = createDebugLogger(debugStructureEmployeuseCreation)

  log('Starting initialization for user', { userId, email })

  // Step 1: Try Dataspace API
  const dataspaceResult = await getMediateurFromDataspaceApi({ email })

  log('Dataspace API result', {
    isError: isDataspaceApiError(dataspaceResult),
    isNull: dataspaceResult === null,
    hasData: !!dataspaceResult && !isDataspaceApiError(dataspaceResult),
    ...(isDataspaceApiError(dataspaceResult)
      ? { error: dataspaceResult.error }
      : {}),
    ...(dataspaceResult && !isDataspaceApiError(dataspaceResult)
      ? {
          structuresEmployeusesCount:
            dataspaceResult.structures_employeuses?.length ?? 0,
          lieuxActiviteCount: dataspaceResult.lieux_activite?.length ?? 0,
          isCoordinateur: dataspaceResult.is_coordinateur,
          isConseillerNumerique: dataspaceResult.is_conseiller_numerique,
        }
      : {}),
  })

  // If Dataspace API error (not just not found), log but continue
  if (isDataspaceApiError(dataspaceResult)) {
    // Log error but continue with fallback
    // biome-ignore lint/suspicious/noConsole: Intentional error logging
    console.error('Dataspace API error:', dataspaceResult.error.message)
  }

  // If found in Dataspace (and not an error)
  if (
    dataspaceResult &&
    !isDataspaceApiError(dataspaceResult) &&
    dataspaceResult !== null
  ) {
    const dataspaceData = dataspaceResult

    // Update user's profile inscription based on Dataspace data
    await updateUserInscriptionProfileFromDataspace({
      user: { id: userId },
      dataspaceData,
    })

    log('Updated user inscription profile from Dataspace', {
      isConseillerNumerique: dataspaceData.is_conseiller_numerique,
      isCoordinateur: dataspaceData.is_coordinateur,
    })

    // Use shared core for idempotent sync
    // This handles:
    // - Coordinateur creation (only if is_coordinateur is true)
    // - Mediateur creation (only if lieux_activite exists)
    // - Structures employeuses sync (only if is_conseiller_numerique is true)
    // - Lieux d'activité sync
    const syncResult = await syncFromDataspaceCore({
      userId,
      dataspaceData,
      wasConseillerNumerique: false, // First time initialization
    })

    log('Sync from Dataspace core result', {
      success: syncResult.success,
      noOp: syncResult.noOp,
      mediateurId: syncResult.mediateurId,
      coordinateurId: syncResult.coordinateurId,
      changes: syncResult.changes,
    })

    // Mark lieux as imported if we synced any
    if (syncResult.changes.lieuxActiviteSynced > 0) {
      await prismaClient.user.update({
        where: { id: userId },
        data: {
          importedLieuxFromDataspace: new Date(),
        },
      })
    }

    // For non-CN users (or CN users), check SIRET fallback for structure employeuse
    // This handles the case where Dataspace doesn't have structures but user has SIRET
    const userAfterSync = await prismaClient.user.findUnique({
      where: { id: userId },
      select: {
        siret: true,
        emplois: {
          select: {
            id: true,
            structure: {
              select: {
                nom: true,
                codeInsee: true,
              },
            },
          },
          where: { suppression: null },
        },
      },
    })

    if (
      userAfterSync &&
      !sessionUserHasStructureEmployeuse(userAfterSync) &&
      userAfterSync.siret
    ) {
      log('Fallback: importing structure employeuse from SIRET', {
        siret: userAfterSync.siret,
      })
      const importResult = await importStructureEmployeuseFromSiret({
        userId,
        siret: userAfterSync.siret,
        log,
      })
      log('Import structure employeuse from SIRET result', importResult)
    }

    // Fetch updated user for next step determination
    const updatedUser = await prismaClient.user.findUnique({
      where: { id: userId },
      select: sessionUserSelect,
    })

    if (!updatedUser) {
      throw new Error('User not found after initialization')
    }

    // Determine next step
    const hasLieuxActivite = (updatedUser.mediateur?._count.enActivite ?? 0) > 0

    log('User state after initialization', {
      hasStructureEmployeuse: sessionUserHasStructureEmployeuse(updatedUser),
      emploisCount: updatedUser.emplois.length,
      emplois: updatedUser.emplois.map((e) => ({
        id: e.id,
        structureNom: e.structure.nom,
        structureId: e.structure.id,
      })),
      hasLieuxActivite,
      profilInscription: updatedUser.profilInscription,
    })

    const nextStep = getNextInscriptionStep({
      currentStep: 'initialize',
      flowType: 'withDataspace',
      profilInscription: updatedUser.profilInscription,
      hasLieuxActivite,
      isConseillerNumerique: dataspaceData.is_conseiller_numerique,
    })

    log('Initialization complete (with Dataspace)', { nextStep })

    return {
      nextStepPath: nextStep ? getStepPath(nextStep) : null,
    }
  }

  // User not found in Dataspace
  log('User not found in Dataspace, checking for SIRET fallback')

  // If user has SIRET and no structure employeuse yet, create from SIRET
  const user = await prismaClient.user.findUnique({
    where: { id: userId },
    select: {
      siret: true,
      emplois: {
        select: {
          id: true,
          structure: {
            select: {
              nom: true,
              codeInsee: true,
            },
          },
        },
        where: {
          suppression: null,
        },
      },
    },
  })

  log('User state for SIRET fallback', {
    siret: user?.siret ?? null,
    emploisCount: user?.emplois.length ?? 0,
    hasStructureEmployeuse: user
      ? sessionUserHasStructureEmployeuse(user)
      : false,
  })

  if (user && !sessionUserHasStructureEmployeuse(user) && user.siret) {
    log('Importing structure employeuse from SIRET (no Dataspace)', {
      siret: user.siret,
    })
    const importResult = await importStructureEmployeuseFromSiret({
      userId,
      siret: user.siret,
      log,
    })
    log('Import structure employeuse from SIRET result', importResult)
  } else if (user && !user.siret) {
    log('User has no SIRET, cannot create structure employeuse')
  }

  // Determine next step for users without Dataspace data
  const nextStep = getNextInscriptionStep({
    currentStep: 'initialize',
    flowType: 'withoutDataspace',
    profilInscription: null,
    hasLieuxActivite: false,
    isConseillerNumerique: false,
  })

  log('Initialization complete (no Dataspace)', { nextStep })

  return {
    nextStepPath: nextStep ? getStepPath(nextStep) : null,
  }
}
