import { sessionUserSelect } from '@app/web/auth/getSessionUserFromSessionToken'
import type { SessionUser } from '@app/web/auth/sessionUser'
import type { DataspaceMediateur } from '@app/web/external-apis/dataspace/dataspaceApiClient'
import { hasActiveContractFromDataspace } from '@app/web/features/dataspace/getProfileFromDataspace'
import {
  importCoordinateurFromDataspace,
  importMediateurFromDataspace,
} from '@app/web/features/dataspace/importMediateurFromDataspace'
import { prismaClient } from '@app/web/prismaClient'
import type { ProfilInscription } from '@prisma/client'

/**
 * Creates the mediateur object if needed
 * Imports the data from Dataspace if needed depending on the checked profil
 *
 * This is the Dataspace equivalent of initializeAndimportUserDataFromV1
 */
export const initializeAndImportUserDataFromDataspace = async ({
  user,
  dataspaceData,
}: {
  user: Pick<SessionUser, 'id' | 'email'> & {
    profilInscription: ProfilInscription
  }
  dataspaceData: DataspaceMediateur | null
}) => {
  const { profilInscription } = user

  // Nothing to import if the profileInscription has nothing to do with Dataspace data
  if (profilInscription === 'Mediateur') {
    const initializedMediateur = await prismaClient.user.update({
      where: { id: user.id },
      data: {
        mediateur: {
          connectOrCreate: {
            where: { userId: user.id },
            create: {},
          },
        },
      },
      select: sessionUserSelect,
    })

    return initializedMediateur
  }

  // Error if the dataspaceData is null and needed for the intendedProfileInscription
  if (!dataspaceData || !hasActiveContractFromDataspace(dataspaceData)) {
    throw new Error(
      `Active Dataspace conseiller not found for checked profil inscription ${profilInscription}`,
    )
  }

  // Update dataspaceId on user
  await prismaClient.user.update({
    where: { id: user.id },
    data: { dataspaceId: dataspaceData.id },
  })

  // Import based on profile
  if (
    profilInscription === 'Coordinateur' ||
    profilInscription === 'CoordinateurConseillerNumerique'
  ) {
    // Import coordinateur data
    await importCoordinateurFromDataspace({
      userId: user.id,
      dataspaceData,
    })

    // If also conseiller numérique, import mediateur data too
    if (dataspaceData.is_conseiller_numerique) {
      await importMediateurFromDataspace({
        userId: user.id,
        dataspaceData,
      })
    }

    // Update lifecycle timestamps
    const updatedUser = await prismaClient.user.update({
      where: { id: user.id },
      data: {
        donneesCoordinateurConseillerNumeriqueV1Importees: new Date(),
        structureEmployeuseRenseignee:
          dataspaceData.structures_employeuses.length > 0
            ? new Date()
            : undefined,
        lieuxActiviteRenseignes:
          dataspaceData.lieux_activite.length > 0 ? new Date() : undefined,
      },
      select: sessionUserSelect,
    })

    return updatedUser
  }

  // Import conseiller numérique / mediateur data
  await importMediateurFromDataspace({
    userId: user.id,
    dataspaceData,
  })

  // Update lifecycle timestamps
  const updatedUser = await prismaClient.user.update({
    where: { id: user.id },
    data: {
      donneesConseillerNumeriqueV1Importees: new Date(),
      structureEmployeuseRenseignee:
        dataspaceData.structures_employeuses.length > 0
          ? new Date()
          : undefined,
      lieuxActiviteRenseignes:
        dataspaceData.lieux_activite.length > 0 ? new Date() : undefined,
    },
    select: sessionUserSelect,
  })

  return updatedUser
}
