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

export const initializeInscription = async ({
  userId,
  email,
}: {
  userId: string
  email: string
}): Promise<InitializeInscriptionResult> => {
  // Step 1: Try Dataspace API
  const dataspaceResult = await getMediateurFromDataspaceApi({ email })

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

    const hasStructureEmployeuse =
      userBeforeStructureImport &&
      sessionUserHasStructureEmployeuse(userBeforeStructureImport)

    if (!hasStructureEmployeuse) {
      // Try dataspace structures first
      if (
        dataspaceData.structures_employeuses &&
        dataspaceData.structures_employeuses.length > 0
      ) {
        const primaryStructure = getPrimaryStructureEmployeuse(
          dataspaceData.structures_employeuses,
        )
        if (primaryStructure) {
          await importStructureEmployeuseFromDataspace({
            userId,
            structureEmployeuse: primaryStructure,
          })
        }
      } else if (userBeforeStructureImport?.siret) {
        // Fallback: no structure from dataspace but user has SIRET
        await importStructureEmployeuseFromSiret({
          userId,
          siret: userBeforeStructureImport.siret,
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

    const nextStep = getNextInscriptionStep({
      currentStep: 'initialize',
      flowType: 'withDataspace',
      profilInscription: updatedUser.profilInscription,
      hasLieuxActivite,
      isConseillerNumerique: dataspaceData.is_conseiller_numerique,
    })

    return {
      nextStepPath: nextStep ? getStepPath(nextStep) : null,
    }
  }

  // User not found in Dataspace
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

  if (user && !sessionUserHasStructureEmployeuse(user) && user.siret) {
    await importStructureEmployeuseFromSiret({
      userId,
      siret: user.siret,
    })
  }

  // Determine next step for users without Dataspace data
  const nextStep = getNextInscriptionStep({
    currentStep: 'initialize',
    flowType: 'withoutDataspace',
    profilInscription: null,
    hasLieuxActivite: false,
    isConseillerNumerique: false,
  })
  return {
    nextStepPath: nextStep ? getStepPath(nextStep) : null,
  }
}
