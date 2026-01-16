import type { DataspaceConseillerNumeriqueCoordonne } from '@app/web/external-apis/dataspace/dataspaceApiClient'
import { prismaClient } from '@app/web/prismaClient'
import { v4 } from 'uuid'

/**
 * Find coordinateurs in our database that coordinate this mediateur
 * Uses the coop IDs from Dataspace to match with our Coordinateur records
 */
const findCoordinateursForMediateur = async ({
  conseillersCoordonnes,
}: {
  conseillersCoordonnes: DataspaceConseillerNumeriqueCoordonne[]
}): Promise<{ id: string }[]> => {
  if (conseillersCoordonnes.length === 0) {
    return []
  }

  // Extract coop IDs to search for coordinateurs
  const coopIds = conseillersCoordonnes
    .map((c) => c.ids.coop)
    .filter((id): id is string => id !== null)

  if (coopIds.length === 0) {
    return []
  }

  // Find coordinateurs that match by coop UUID through mediateur
  return prismaClient.coordinateur.findMany({
    where: {
      user: {
        mediateur: {
          id: { in: coopIds },
        },
      },
    },
    select: {
      id: true,
    },
  })
}

/**
 * Create MediateurCoordonne relations for a mediateur
 * Links the mediateur to coordinateurs found in Dataspace data
 */
export const importCoordonnesFromDataspace = async ({
  mediateurId,
  conseillersCoordonnes,
}: {
  mediateurId: string
  conseillersCoordonnes: DataspaceConseillerNumeriqueCoordonne[]
}): Promise<{ coordinateurIds: string[] }> => {
  const coordinateurs = await findCoordinateursForMediateur({
    conseillersCoordonnes,
  })

  if (coordinateurs.length === 0) {
    return { coordinateurIds: [] }
  }

  // Create MediateurCoordonne relations for each coordinateur
  await Promise.all(
    coordinateurs.map(async (coordinateur) => {
      const existing = await prismaClient.mediateurCoordonne.findFirst({
        where: {
          mediateurId,
          coordinateurId: coordinateur.id,
          suppression: null,
        },
        select: {
          id: true,
        },
      })

      if (existing) {
        return existing
      }

      return prismaClient.mediateurCoordonne.create({
        data: {
          id: v4(),
          mediateurId,
          coordinateurId: coordinateur.id,
        },
      })
    }),
  )

  return {
    coordinateurIds: coordinateurs.map((c) => c.id),
  }
}

/**
 * Import conseillers coordonnés for a coordinateur
 * Links mediateurs to this coordinateur based on Dataspace data
 */
export const importConseillersCooordonnesForCoordinateur = async ({
  coordinateurId,
  conseillersCoordonnes,
}: {
  coordinateurId: string
  conseillersCoordonnes: DataspaceConseillerNumeriqueCoordonne[]
}): Promise<{ mediateurIds: string[] }> => {
  if (conseillersCoordonnes.length === 0) {
    return { mediateurIds: [] }
  }

  // Find mediateurs by their coop ID only
  const coopIds = conseillersCoordonnes
    .map((c) => c.ids.coop)
    .filter((id): id is string => id !== null)

  if (coopIds.length === 0) {
    return { mediateurIds: [] }
  }

  const mediateurs = await prismaClient.mediateur.findMany({
    where: {
      id: { in: coopIds },
    },
    select: {
      id: true,
    },
  })

  if (mediateurs.length === 0) {
    return { mediateurIds: [] }
  }

  // Create MediateurCoordonne relations
  await Promise.all(
    mediateurs.map(async (mediateur) => {
      const existing = await prismaClient.mediateurCoordonne.findFirst({
        where: {
          mediateurId: mediateur.id,
          coordinateurId,
          suppression: null,
        },
        select: {
          id: true,
        },
      })

      if (existing) {
        return existing
      }

      return prismaClient.mediateurCoordonne.create({
        data: {
          id: v4(),
          mediateurId: mediateur.id,
          coordinateurId,
        },
      })
    }),
  )

  return {
    mediateurIds: mediateurs.map((m) => m.id),
  }
}
