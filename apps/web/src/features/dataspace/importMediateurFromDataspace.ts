import type { DataspaceMediateur } from '@app/web/external-apis/dataspace/dataspaceApiClient'
import {
  importConseillersCooordonnesForCoordinateur,
  importCoordonnesFromDataspace,
} from '@app/web/features/dataspace/importCoordonnesFromDataspace'
import { importLieuxActiviteFromDataspace } from '@app/web/features/dataspace/importLieuxActiviteFromDataspace'
import {
  getPrimaryStructureEmployeuse,
  importStructureEmployeuseFromDataspace,
} from '@app/web/features/dataspace/importStructureEmployeuseFromDataspace'
import { prismaClient } from '@app/web/prismaClient'

export type ImportMediateurFromDataspaceResult = {
  mediateurId: string
  coordinateurId: string | null
  structureEmployeuseId: string | null
  lieuxActiviteIds: string[]
  coordinateurIds: string[]
}

/**
 * Main orchestrator to import a mediateur from Dataspace API data
 * Creates/updates Mediateur, structure employeuse, lieux d'activité
 * Note: isConseillerNumerique is set on User separately (not here)
 */
export const importMediateurFromDataspace = async ({
  userId,
  dataspaceData,
}: {
  userId: string
  dataspaceData: DataspaceMediateur
}): Promise<ImportMediateurFromDataspaceResult> => {
  // 1. Create or get mediateur
  const mediateur = await prismaClient.mediateur.upsert({
    where: { userId },
    create: { userId },
    update: {},
    select: { id: true },
  })

  // 2. Import structure employeuse
  let structureEmployeuseId: string | null = null
  const primaryStructure = getPrimaryStructureEmployeuse(
    dataspaceData.structures_employeuses,
  )

  if (primaryStructure) {
    const result = await importStructureEmployeuseFromDataspace({
      userId,
      structureEmployeuse: primaryStructure,
    })
    structureEmployeuseId = result.structureId
  }

  // 3. Import lieux d'activité
  const { structureIds: lieuxActiviteIds } =
    await importLieuxActiviteFromDataspace({
      mediateurId: mediateur.id,
      lieuxActivite: dataspaceData.lieux_activite,
    })

  // 4. Import coordinations (link to coordinateurs)
  const { coordinateurIds } = await importCoordonnesFromDataspace({
    mediateurId: mediateur.id,
    conseillersCoordonnes: dataspaceData.conseillers_numeriques_coordonnes,
  })

  return {
    mediateurId: mediateur.id,
    coordinateurId: null, // Not creating coordinateur in this flow
    structureEmployeuseId,
    lieuxActiviteIds,
    coordinateurIds,
  }
}

/**
 * Import coordinateur data from Dataspace API
 * Creates/updates Coordinateur, imports conseillers coordonnés
 * Note: isConseillerNumerique is set on User separately (not here)
 */
export const importCoordinateurFromDataspace = async ({
  userId,
  dataspaceData,
}: {
  userId: string
  dataspaceData: DataspaceMediateur
}): Promise<{
  coordinateurId: string
  mediateursCoordonnesIds: string[]
}> => {
  // 1. Create or update coordinateur
  const coordinateur = await prismaClient.coordinateur.upsert({
    where: { userId },
    create: {
      userId,
    },
    update: {},
    select: { id: true },
  })

  // 2. Import conseillers coordonnés
  const { mediateurIds } = await importConseillersCooordonnesForCoordinateur({
    coordinateurId: coordinateur.id,
    conseillersCoordonnes: dataspaceData.conseillers_numeriques_coordonnes,
  })

  return {
    coordinateurId: coordinateur.id,
    mediateursCoordonnesIds: mediateurIds,
  }
}
