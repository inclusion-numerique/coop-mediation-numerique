import type { DataspaceMediateur } from '@app/web/external-apis/dataspace/dataSpaceApiClient'
import {
  importCoordonnesFromDataspace,
  importConseillersCooordonnesForCoordinateur,
} from '@app/web/features/dataspace/importCoordonnesFromDataspace'
import { importLieuxActiviteFromDataspace } from '@app/web/features/dataspace/importLieuxActiviteFromDataspace'
import {
  getPrimaryStructureEmployeuse,
  importStructureEmployeuseFromDataspace,
} from '@app/web/features/dataspace/importStructureEmployeuseFromDataspace'
import { prismaClient } from '@app/web/prismaClient'
import { v4 } from 'uuid'

export type ImportMediateurFromDataspaceResult = {
  mediateurId: string
  conseillerNumeriqueId: string | null
  coordinateurId: string | null
  structureEmployeuseId: string | null
  lieuxActiviteIds: string[]
  coordinateurIds: string[]
}

/**
 * Main orchestrator to import a mediateur from Dataspace API data
 * Creates/updates Mediateur, ConseillerNumerique, structure employeuse, lieux d'activité
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

  let conseillerNumeriqueId: string | null = null

  // 2. Create ConseillerNumerique if user is conseiller numérique
  if (dataspaceData.is_conseiller_numerique) {
    // Use dataspaceData.id as idPg (integer ID from Dataspace)
    const existingConseiller = await prismaClient.conseillerNumerique.findFirst(
      {
        where: {
          OR: [{ mediateurId: mediateur.id }, { idPg: dataspaceData.id }],
        },
        select: { id: true },
      },
    )

    if (existingConseiller) {
      // Update existing
      await prismaClient.conseillerNumerique.update({
        where: { id: existingConseiller.id },
        data: {
          mediateurId: mediateur.id,
          idPg: dataspaceData.id,
        },
      })
      conseillerNumeriqueId = existingConseiller.id
    } else {
      // Create new - generate ID since we don't have MongoDB ObjectId from Dataspace
      const newConseiller = await prismaClient.conseillerNumerique.create({
        data: {
          id: v4(),
          mediateurId: mediateur.id,
          idPg: dataspaceData.id,
        },
        select: { id: true },
      })
      conseillerNumeriqueId = newConseiller.id
    }
  }

  // 3. Import structure employeuse
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

  // 4. Import lieux d'activité
  const { structureIds: lieuxActiviteIds } =
    await importLieuxActiviteFromDataspace({
      mediateurId: mediateur.id,
      lieuxActivite: dataspaceData.lieux_activite,
    })

  // 5. Import coordinations (link to coordinateurs)
  const { coordinateurIds } = await importCoordonnesFromDataspace({
    mediateurId: mediateur.id,
    conseillersCoordonnes: dataspaceData.conseillers_numeriques_coordonnes,
  })

  return {
    mediateurId: mediateur.id,
    conseillerNumeriqueId,
    coordinateurId: null, // Not creating coordinateur in this flow
    structureEmployeuseId,
    lieuxActiviteIds,
    coordinateurIds,
  }
}

/**
 * Import coordinateur data from Dataspace API
 * Creates/updates Coordinateur, imports conseillers coordonnés
 * Sets conseillerNumeriqueIdPg if is_conseiller_numerique
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
  // Set conseillerNumeriqueIdPg if user is also a conseiller numérique
  const conseillerNumeriqueIdPg = dataspaceData.is_conseiller_numerique
    ? dataspaceData.id
    : null

  // 1. Create or update coordinateur
  const coordinateur = await prismaClient.coordinateur.upsert({
    where: { userId },
    create: {
      userId,
      conseillerNumeriqueIdPg,
    },
    update: {
      conseillerNumeriqueIdPg,
    },
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

