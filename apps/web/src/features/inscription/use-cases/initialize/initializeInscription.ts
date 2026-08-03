import { sessionUserSelect } from '@app/web/auth/getSessionUserFromSessionToken'
import {
  getMediateurFromDataspaceApi,
  isDataspaceApiError,
} from '@app/web/external-apis/dataspace/dataspaceApiClient'
import {
  importLieuxActiviteFromDataspace,
  syncFromDataspaceCore,
  upsertMediateur,
} from '@app/web/features/dataspace/syncFromDataspaceCore'
import { updateUserInscriptionProfileFromDataspace } from '@app/web/features/dataspace/updateUserInscriptionProfileFromDataspace'
import {
  personneToEmployeuseActuelle,
  rattacherAUneEmployeuseDepuisSiret,
} from '@app/web/features/employeuse'
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
 * - Structures employeuses: Only synced if is_conseiller_numerique is true
 *
 * Lieux d'activité import (one-time only during inscription):
 * - Import if is_conseiller_numerique is true AND has lieux_activite in dataspace AND user has NO existing lieux
 * - Never synced again after first import
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
    // - Structures employeuses sync (only if is_conseiller_numerique is true)
    const syncResult = await syncFromDataspaceCore({
      userId,
      dataspaceData,
      wasConseillerNumerique: false, // First time initialization
    })

    log('Sync from Dataspace core result', {
      success: syncResult.success,
      noOp: syncResult.noOp,
      coordinateurId: syncResult.coordinateurId,
      changes: syncResult.changes,
    })

    // --- One-time lieux d'activité import during inscription ---
    // Only import if: is_conseiller_numerique AND has lieux_activite AND user has NO existing lieux
    let lieuxActiviteSynced = 0
    const lieuxActivite = dataspaceData.lieux_activite ?? []
    const hasLieuxActiviteInDataspace = lieuxActivite.length > 0

    // We create mediateur if we are importing data from dataspace
    // - if user is a conseiller_numerique and NOT "only a coordinateur"
    // - only a coordinateur means "coordinateur is true" and "NO lieux activites in dataspace"
    let mediateurId: string | null = null
    if (
      dataspaceData.is_conseiller_numerique &&
      (!dataspaceData.is_coordinateur || hasLieuxActiviteInDataspace)
    ) {
      // Create or get mediateur
      const upsertedMediateur = await upsertMediateur({ userId })
      mediateurId = upsertedMediateur.mediateurId
    }

    if (dataspaceData.is_conseiller_numerique && hasLieuxActiviteInDataspace) {
      // Check if user already has lieux d'activité
      const existingMediateur = await prismaClient.mediateur.findUnique({
        where: { userId },
        select: {
          id: true,
          _count: {
            select: {
              enActivite: {
                where: { suppression: null, fin: null },
              },
            },
          },
        },
      })

      const hasExistingLieux =
        existingMediateur && existingMediateur._count.enActivite > 0

      if (!hasExistingLieux) {
        log('Importing lieux activite from Dataspace (first time only)', {
          lieuxCount: lieuxActivite.length,
        })

        // Import lieux d'activité
        if (!mediateurId) {
          // will never happen, needed for type safety
          throw new Error(
            'Mediateur not found for initialization of lieux activite',
          )
        }
        const { structureIds } = await importLieuxActiviteFromDataspace({
          mediateurId,
          lieuxActivite,
        })

        lieuxActiviteSynced = structureIds.length

        // Mark as imported
        await prismaClient.user.update({
          where: { id: userId },
          data: {
            importedLieuxFromDataspace: new Date(),
          },
        })

        log('Lieux activite imported', {
          count: lieuxActiviteSynced,
        })
      } else {
        log('User already has lieux activite, skipping import', {
          existingCount: existingMediateur._count.enActivite,
        })
      }
    }

    // For non-CN users (or CN users), check SIRET fallback for structure employeuse
    // This handles the case where Dataspace doesn't have structures but user has SIRET
    const userAfterSync = await prismaClient.user.findUnique({
      where: { id: userId },
      select: {
        siret: true,
        // ADR-002 échange final : présence d'employeuse testée sur les affectations MAIN actives
        // (les emplois coop sont gelés / vides pour un nouvel utilisateur).
        personneMain: {
          select: {
            affectationsEmploi: {
              where: { estActive: true },
              select: { id: true },
            },
          },
        },
      },
    })

    if (
      userAfterSync &&
      (userAfterSync.personneMain?.affectationsEmploi.length ?? 0) === 0 &&
      userAfterSync.siret
    ) {
      log('Fallback: importing structure employeuse from SIRET', {
        siret: userAfterSync.siret,
      })
      const rattachement = await rattacherAUneEmployeuseDepuisSiret({
        userId,
        siret: userAfterSync.siret,
      })
      log('Rattachement employeuse depuis SIRET', {
        resultat: rattachement._tag,
      })
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

    // Employeuse courante en pur main (sessionUserSelect expose désormais `personneMain`).
    const employeuseActuelle = personneToEmployeuseActuelle(
      updatedUser.personneMain,
    )
    log('User state after initialization', {
      hasStructureEmployeuse: employeuseActuelle !== null,
      employeuse: employeuseActuelle
        ? {
            structureMainId: employeuseActuelle.employeuse.id,
            nom: employeuseActuelle.employeuse.denomination,
            source: employeuseActuelle.source,
          }
        : null,
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
      // ADR-002 échange final : la présence d'une employeuse se teste sur les affectations MAIN
      // actives (les emplois coop sont gelés / vides pour un nouvel utilisateur).
      personneMain: {
        select: {
          affectationsEmploi: {
            where: { estActive: true },
            select: { id: true },
          },
        },
      },
    },
  })

  const hasStructureEmployeuse =
    (user?.personneMain?.affectationsEmploi.length ?? 0) > 0

  log('User state for SIRET fallback', {
    siret: user?.siret ?? null,
    hasStructureEmployeuse,
  })

  if (user && !hasStructureEmployeuse && user.siret) {
    log('Importing structure employeuse from SIRET (no Dataspace)', {
      siret: user.siret,
    })
    const rattachement = await rattacherAUneEmployeuseDepuisSiret({
      userId,
      siret: user.siret,
    })
    log('Rattachement employeuse depuis SIRET', { resultat: rattachement._tag })
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
