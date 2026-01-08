import { sessionUserSelect } from '@app/web/auth/getSessionUserFromSessionToken'
import { sessionUserHasStructureEmployeuse } from '@app/web/auth/sessionUser'
import {
  getMediateurFromDataspaceApi,
  isDataspaceApiError,
} from '@app/web/external-apis/dataspace/dataspaceApiClient'
import { importLieuxActiviteFromDataspace } from '@app/web/features/dataspace/importLieuxActiviteFromDataspace'
import {
  getPrimaryStructureEmployeuse,
  importStructureEmployeuseFromDataspace,
} from '@app/web/features/dataspace/importStructureEmployeuseFromDataspace'
import { syncUserFromDataspace } from '@app/web/features/dataspace/syncUserFromDataspace'
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

    // Sync user roles from Dataspace
    await updateUserInscriptionProfileFromDataspace({
      user: { id: userId },
      dataspaceData,
    })
    const syncResult = await syncUserFromDataspace({ userId, email })

    // Import structures employeuses if user doesn't have one yet
    const userBeforeStructureImport = await prismaClient.user.findUnique({
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

    log('User state before structure import', {
      siret: userBeforeStructureImport?.siret ?? null,
      emploisCount: userBeforeStructureImport?.emplois.length ?? 0,
      emplois: userBeforeStructureImport?.emplois.map((e) => ({
        id: e.id,
        structureNom: e.structure.nom,
        structureCodeInsee: e.structure.codeInsee,
      })),
    })

    const hasStructureEmployeuse =
      userBeforeStructureImport &&
      sessionUserHasStructureEmployeuse(userBeforeStructureImport)

    log('Has structure employeuse check', { hasStructureEmployeuse })

    if (!hasStructureEmployeuse) {
      // Try dataspace structures first
      if (
        dataspaceData.structures_employeuses &&
        dataspaceData.structures_employeuses.length > 0
      ) {
        const primaryStructure = getPrimaryStructureEmployeuse(
          dataspaceData.structures_employeuses,
        )

        log('Dataspace structures employeuses', {
          count: dataspaceData.structures_employeuses.length,
          structures: dataspaceData.structures_employeuses.map((s) => ({
            nom: s.nom,
            siret: s.siret,
            contratsCount: s.contrats?.length ?? 0,
            contrats: s.contrats?.map((c) => ({
              type: c.type,
              dateDebut: c.date_debut,
              dateFin: c.date_fin,
              dateRupture: c.date_rupture,
            })),
          })),
          primaryStructure: primaryStructure
            ? {
                nom: primaryStructure.nom,
                siret: primaryStructure.siret,
              }
            : null,
        })

        if (primaryStructure) {
          log('Importing structure employeuse from Dataspace', {
            nom: primaryStructure.nom,
            siret: primaryStructure.siret,
          })
          const importResult = await importStructureEmployeuseFromDataspace({
            userId,
            structureEmployeuse: primaryStructure,
            log,
          })
          log('Import structure employeuse from Dataspace result', importResult)
        } else {
          log(
            'No primary structure found despite having structures_employeuses',
          )
        }
      } else if (userBeforeStructureImport?.siret) {
        // Fallback: no structure from dataspace but user has SIRET
        log('Fallback: importing structure employeuse from SIRET', {
          siret: userBeforeStructureImport.siret,
        })
        const importResult = await importStructureEmployeuseFromSiret({
          userId,
          siret: userBeforeStructureImport.siret,
          log,
        })
        log('Import structure employeuse from SIRET result', importResult)
      } else {
        log('No structure employeuse source available', {
          hasDataspaceStructures: false,
          userSiret: null,
        })
      }
    }

    // Import lieux d'activité if user is mediateur
    if (
      syncResult.mediateurId &&
      !dataspaceData.is_coordinateur &&
      dataspaceData.lieux_activite &&
      dataspaceData.lieux_activite.length > 0
    ) {
      const dataspaceImportLieuxResult = await importLieuxActiviteFromDataspace(
        {
          mediateurId: syncResult.mediateurId,
          lieuxActivite: dataspaceData.lieux_activite,
        },
      )
      if (dataspaceImportLieuxResult.structureIds.length > 0) {
        // Mark lieux as imported to customize the inscription flow
        await prismaClient.user.update({
          where: { id: userId },
          data: {
            importedLieuxFromDataspace: new Date(),
          },
        })
      }
    }

    // Fetch updated user
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
