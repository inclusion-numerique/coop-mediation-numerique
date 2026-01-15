import type {
  DataspaceContrat,
  DataspaceMediateur,
  DataspaceStructureEmployeuse,
} from '@app/web/external-apis/dataspace/dataspaceApiClient'
import {
  getMediateurFromDataspaceApi,
  isDataspaceApiError,
} from '@app/web/external-apis/dataspace/dataspaceApiClient'
import { findOrCreateStructure } from '@app/web/features/structures/findOrCreateStructure'
import { prismaClient } from '@app/web/prismaClient'
import { v4 } from 'uuid'

export type UpdateUserFromDataspaceResult = {
  success: boolean
  noOp: boolean
  error?: string
  changes: {
    conseillerNumeriqueCreated: boolean
    conseillerNumeriqueRemoved: boolean
    coordinateurCreated: boolean
    coordinateurUpdated: boolean
    structuresSynced: number
    structuresRemoved: number
  }
}

/**
 * Check if user is conseiller numérique in local model
 * Checks Mediateur.conseillerNumerique relation
 */
const isConseillerNumeriqueInModel = (user: {
  mediateur: { conseillerNumerique: { id: string } | null } | null
}): boolean => {
  return user.mediateur?.conseillerNumerique !== null
}

/**
 * Check if user is coordinateur conseiller numérique in local model
 * Checks Coordinateur.conseillerNumeriqueId(Pg) fields
 */
const isCoordinateurConseillerNumeriqueInModel = (user: {
  coordinateur: {
    conseillerNumeriqueId: string | null
    conseillerNumeriqueIdPg: number | null
  } | null
}): boolean => {
  return (
    user.coordinateur?.conseillerNumeriqueId !== null ||
    user.coordinateur?.conseillerNumeriqueIdPg !== null
  )
}

/**
 * Build full address from Dataspace address format
 */
const buildAdresseFromDataspace = (adresse: {
  numero_voie: number
  nom_voie: string
  repetition: string | null
}): string => {
  const parts = [adresse.numero_voie.toString()]

  if (adresse.repetition) {
    parts.push(adresse.repetition)
  }

  parts.push(adresse.nom_voie)

  return parts.join(' ').trim()
}

/**
 * Get the active or most recent contract from a list of contracts
 */
const getActiveOrMostRecentContract = (
  contrats: DataspaceContrat[],
): DataspaceContrat | null => {
  if (contrats.length === 0) {
    return null
  }

  const now = new Date()

  // Find active contract (started, not ended, not ruptured)
  const activeContract = contrats.find((contrat) => {
    const dateDebut = new Date(contrat.date_debut)
    const dateFin = new Date(contrat.date_fin)
    const hasNotStarted = dateDebut > now
    const hasEnded = dateFin < now
    const isRuptured = contrat.date_rupture !== null

    return !hasNotStarted && !hasEnded && !isRuptured
  })

  if (activeContract) {
    return activeContract
  }

  // No active contract - return the most recent one by date_debut
  return contrats.toSorted(
    (a, b) =>
      new Date(b.date_debut).getTime() - new Date(a.date_debut).getTime(),
  )[0]
}

/**
 * Get the end date for an emploi based on contract
 * Returns date_rupture if contract was terminated early, otherwise date_fin if contract has ended
 */
const getEmploiEndDate = (contrat: DataspaceContrat): Date | null => {
  // If contract was ruptured, use rupture date
  if (contrat.date_rupture) {
    return new Date(contrat.date_rupture)
  }

  // If contract has ended, use end date
  const dateFin = new Date(contrat.date_fin)
  if (dateFin < new Date()) {
    return dateFin
  }

  // Contract is still active
  return null
}

/**
 * Prepare structure data from Dataspace for EmployeStructure sync
 * Returns structure IDs and contract info for each structure
 */
type PreparedStructure = {
  structureId: string
  contracts: DataspaceContrat[]
  contract: DataspaceContrat | null
}

const prepareStructuresFromDataspace = async (
  structuresEmployeuses: DataspaceStructureEmployeuse[],
): Promise<PreparedStructure[]> => {
  const prepared: PreparedStructure[] = []

  for (const structureEmployeuse of structuresEmployeuses) {
    const adresse = buildAdresseFromDataspace(structureEmployeuse.adresse)

    // Find or create structure (outside transaction - structures are stable)
    const structure = await findOrCreateStructure({
      siret: structureEmployeuse.siret,
      nom: structureEmployeuse.nom,
      adresse,
      codePostal: structureEmployeuse.adresse.code_postal,
      codeInsee: structureEmployeuse.adresse.code_insee,
      commune: structureEmployeuse.adresse.nom_commune,
      nomReferent: structureEmployeuse.contact
        ? `${structureEmployeuse.contact.prenom} ${structureEmployeuse.contact.nom}`.trim()
        : null,
      courrielReferent:
        structureEmployeuse.contact?.courriels?.mail_gestionnaire ?? null,
      telephoneReferent: structureEmployeuse.contact?.telephone ?? null,
    })

    const contracts = structureEmployeuse.contrats ?? []
    prepared.push({
      structureId: structure.id,
      contracts,
      contract: getActiveOrMostRecentContract(contracts),
    })
  }

  return prepared
}

/**
 * Sync ALL structures employeuses from Dataspace data
 * After sync, user has exactly the same EmployeStructure records as in Dataspace.
 * - Creates/updates EmployeStructure for each structure in Dataspace
 * - Removes EmployeStructure records for structures NOT in Dataspace
 * - Edge case: if structure has no contracts, create/keep EmployeStructure with no fin date
 *
 * All EmployeStructure operations are performed in a single transaction.
 * Only called when is_conseiller_numerique: true in Dataspace API
 */
const syncStructuresEmployeusesFromDataspace = async ({
  userId,
  structuresEmployeuses,
}: {
  userId: string
  structuresEmployeuses: DataspaceStructureEmployeuse[]
}): Promise<{ structureIds: string[]; removed: number }> => {
  // Step 1: Prepare all structures (find/create) outside transaction
  const preparedStructures = await prepareStructuresFromDataspace(
    structuresEmployeuses,
  )
  const structureIds = preparedStructures.map((s) => s.structureId)

  // Step 2: Perform all EmployeStructure operations in a single transaction
  const result = await prismaClient.$transaction(async (tx) => {
    let removedCount = 0

    // Get all existing emplois for this user
    const existingEmplois = await tx.employeStructure.findMany({
      where: { userId },
      select: {
        id: true,
        structureId: true,
        debut: true,
        fin: true,
        suppression: true,
      },
    })

    // Create a map for quick lookup
    const emploisByStructureId = new Map(
      existingEmplois.map((e) => [e.structureId, e]),
    )

    // Process each structure from Dataspace
    for (const { structureId, contracts, contract } of preparedStructures) {
      const existingEmploi = emploisByStructureId.get(structureId)

      // Handle case where there are no contracts from API
      // Edge case: create/keep EmployeStructure with no fin date
      if (contracts.length === 0) {
        if (existingEmploi) {
          // Keep existing emploi but remove fin/suppression to ensure user stays active
          if (
            existingEmploi.fin !== null ||
            existingEmploi.suppression !== null
          ) {
            await tx.employeStructure.update({
              where: { id: existingEmploi.id },
              data: {
                fin: null,
                suppression: null,
              },
            })
          }
          // Otherwise keep as-is
        } else {
          // Create new "fictive" emploi without fin date (active employment)
          await tx.employeStructure.create({
            data: {
              userId,
              structureId,
              debut: new Date(),
              fin: null,
              suppression: null,
            },
          })
        }
      } else {
        // Calculate dates from contract
        const creationDate = contract
          ? new Date(contract.date_debut)
          : new Date()
        const suppressionDate = contract ? getEmploiEndDate(contract) : null

        if (existingEmploi) {
          // Update existing emploi with contract dates if different
          if (
            existingEmploi.debut.getTime() !== creationDate.getTime() ||
            existingEmploi.fin?.getTime() !== suppressionDate?.getTime()
          ) {
            await tx.employeStructure.update({
              where: { id: existingEmploi.id },
              data: {
                debut: creationDate,
                fin: suppressionDate,
                suppression: suppressionDate,
              },
            })
          }
        } else {
          // Create new emploi with contract dates
          await tx.employeStructure.create({
            data: {
              userId,
              structureId,
              debut: creationDate,
              fin: suppressionDate,
              suppression: suppressionDate,
            },
          })
        }
      }
    }

    // Remove EmployeStructure records for structures NOT in Dataspace
    // This ensures user has exactly the same structures as in Dataspace after sync
    const deleteResult = await tx.employeStructure.deleteMany({
      where: {
        userId,
        structureId: {
          notIn: structureIds,
        },
      },
    })
    removedCount = deleteResult.count

    return { removedCount }
  })

  return { structureIds, removed: result.removedCount }
}

/**
 * Create ConseillerNumerique for a mediateur
 * Creates Mediateur if it doesn't exist
 */
const createConseillerNumerique = async ({
  userId,
  dataspaceId,
}: {
  userId: string
  dataspaceId: number
}): Promise<{ mediateurId: string; conseillerNumeriqueId: string }> => {
  // Create or get mediateur
  const mediateur = await prismaClient.mediateur.upsert({
    where: { userId },
    create: { userId },
    update: {},
    select: { id: true },
  })

  // Check if ConseillerNumerique already exists (by idPg or mediateurId)
  const existingConseiller = await prismaClient.conseillerNumerique.findFirst({
    where: {
      OR: [{ mediateurId: mediateur.id }, { idPg: dataspaceId }],
    },
    select: { id: true },
  })

  if (existingConseiller) {
    // Update existing
    await prismaClient.conseillerNumerique.update({
      where: { id: existingConseiller.id },
      data: {
        mediateurId: mediateur.id,
        idPg: dataspaceId,
      },
    })
    return {
      mediateurId: mediateur.id,
      conseillerNumeriqueId: existingConseiller.id,
    }
  }

  // Create new ConseillerNumerique
  const newConseiller = await prismaClient.conseillerNumerique.create({
    data: {
      id: v4(),
      mediateurId: mediateur.id,
      idPg: dataspaceId,
    },
    select: { id: true },
  })

  return {
    mediateurId: mediateur.id,
    conseillerNumeriqueId: newConseiller.id,
  }
}

/**
 * Remove ConseillerNumerique linked to a user's mediateur
 * Keeps EmployeStructure records intact
 */
const removeConseillerNumerique = async ({
  userId,
}: {
  userId: string
}): Promise<boolean> => {
  const mediateur = await prismaClient.mediateur.findUnique({
    where: { userId },
    select: { id: true, conseillerNumerique: { select: { id: true } } },
  })

  if (mediateur?.conseillerNumerique) {
    await prismaClient.conseillerNumerique.delete({
      where: { id: mediateur.conseillerNumerique.id },
    })
    return true
  }

  return false
}

/**
 * Create or update Coordinateur with dispositif (conseillerNumeriqueIdPg)
 */
const upsertCoordinateurWithDispositif = async ({
  userId,
  dataspaceId,
}: {
  userId: string
  dataspaceId: number
}): Promise<{ coordinateurId: string; created: boolean }> => {
  const existingCoordinateur = await prismaClient.coordinateur.findUnique({
    where: { userId },
    select: { id: true },
  })

  if (existingCoordinateur) {
    // Update existing coordinateur with dispositif
    await prismaClient.coordinateur.update({
      where: { id: existingCoordinateur.id },
      data: {
        conseillerNumeriqueIdPg: dataspaceId,
      },
    })
    return { coordinateurId: existingCoordinateur.id, created: false }
  }

  // Create new coordinateur with dispositif
  const newCoordinateur = await prismaClient.coordinateur.create({
    data: {
      userId,
      conseillerNumeriqueIdPg: dataspaceId,
    },
    select: { id: true },
  })

  return { coordinateurId: newCoordinateur.id, created: true }
}

/**
 * Main function to sync user's conseiller numérique and coordinateur status from Dataspace API
 *
 * Called at login to check the account's dispositif:
 * - Was Conum, still Conum → No change
 * - Was Conum, no longer is → Switch to mediateur (remove CN link, keep emplois)
 * - Was not Conum, becomes Conum → Create CN link, import structures
 * - Becomes Coordo conum → ADD Coordo role with dispositif
 * - Not found in API → No-op
 */
export const updateUserFromDataspaceData = async ({
  userId,
}: {
  userId: string
}): Promise<UpdateUserFromDataspaceResult> => {
  // 1. Fetch user with mediateur/coordinateur/emplois
  const user = await prismaClient.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      mediateur: {
        select: {
          id: true,
          conseillerNumerique: {
            select: { id: true },
          },
        },
      },
      coordinateur: {
        select: {
          id: true,
          conseillerNumeriqueId: true,
          conseillerNumeriqueIdPg: true,
        },
      },
    },
  })

  if (!user) {
    return {
      success: false,
      noOp: true,
      error: 'User not found',
      changes: {
        conseillerNumeriqueCreated: false,
        conseillerNumeriqueRemoved: false,
        coordinateurCreated: false,
        coordinateurUpdated: false,
        structuresSynced: 0,
        structuresRemoved: 0,
      },
    }
  }

  // 2. Fetch from Dataspace API by email
  const dataspaceResult = await getMediateurFromDataspaceApi({
    email: user.email,
  })

  // Handle API errors
  if (isDataspaceApiError(dataspaceResult)) {
    return {
      success: false,
      noOp: true,
      error: dataspaceResult.error.message,
      changes: {
        conseillerNumeriqueCreated: false,
        conseillerNumeriqueRemoved: false,
        coordinateurCreated: false,
        coordinateurUpdated: false,
        structuresSynced: 0,
        structuresRemoved: 0,
      },
    }
  }

  // 3. If null (not found) → no-op
  if (dataspaceResult === null) {
    return {
      success: true,
      noOp: true,
      changes: {
        conseillerNumeriqueCreated: false,
        conseillerNumeriqueRemoved: false,
        coordinateurCreated: false,
        coordinateurUpdated: false,
        structuresSynced: 0,
        structuresRemoved: 0,
      },
    }
  }

  const dataspaceData: DataspaceMediateur = dataspaceResult

  // 4. Compare local vs API state and apply transitions
  const wasConseillerNumerique = isConseillerNumeriqueInModel(user)
  const isConseillerNumeriqueInApi = dataspaceData.is_conseiller_numerique
  const wasCoordinateurCn = isCoordinateurConseillerNumeriqueInModel(user)
  const isCoordinateurInApi = dataspaceData.is_coordinateur

  const changes = {
    conseillerNumeriqueCreated: false,
    conseillerNumeriqueRemoved: false,
    coordinateurCreated: false,
    coordinateurUpdated: false,
    structuresSynced: 0,
    structuresRemoved: 0,
  }

  // Update User.dataspaceId
  await prismaClient.user.update({
    where: { id: userId },
    data: {
      dataspaceId: dataspaceData.id,
      lastSyncedFromDataspace: new Date(),
    },
  })

  // --- Conseiller Numérique Transitions ---

  if (!wasConseillerNumerique && isConseillerNumeriqueInApi) {
    // Was not CN, becomes CN: Create CN link + sync structures
    await createConseillerNumerique({
      userId,
      dataspaceId: dataspaceData.id,
    })
    changes.conseillerNumeriqueCreated = true

    // Sync ALL structures employeuses from Dataspace
    const { structureIds, removed } =
      await syncStructuresEmployeusesFromDataspace({
        userId,
        structuresEmployeuses: dataspaceData.structures_employeuses,
      })
    changes.structuresSynced = structureIds.length
    changes.structuresRemoved = removed
  } else if (wasConseillerNumerique && !isConseillerNumeriqueInApi) {
    // Was CN, no longer is: Remove CN link, keep emplois
    const removedCn = await removeConseillerNumerique({ userId })
    changes.conseillerNumeriqueRemoved = removedCn
  } else if (wasConseillerNumerique && isConseillerNumeriqueInApi) {
    // Was CN, still CN: Sync structures to match Dataspace
    const { structureIds, removed } =
      await syncStructuresEmployeusesFromDataspace({
        userId,
        structuresEmployeuses: dataspaceData.structures_employeuses,
      })
    changes.structuresSynced = structureIds.length
    changes.structuresRemoved = removed
  }
  // else: Not CN and not becoming CN → no-op for structures

  // --- Coordinateur Transitions ---

  if (isCoordinateurInApi && isConseillerNumeriqueInApi) {
    // Becomes Coordo conum: ADD Coordo role with dispositif
    const { created } = await upsertCoordinateurWithDispositif({
      userId,
      dataspaceId: dataspaceData.id,
    })
    if (created) {
      changes.coordinateurCreated = true
    } else if (!wasCoordinateurCn) {
      // Existing coordinateur but didn't have dispositif before
      changes.coordinateurUpdated = true
    }
  } else if (wasCoordinateurCn && !isConseillerNumeriqueInApi) {
    // Was Coordo CN, no longer CN: Clear dispositif on Coordinateur
    // (keep Coordinateur role, just remove CN dispositif)
    await prismaClient.coordinateur.update({
      where: { userId },
      data: {
        conseillerNumeriqueId: null,
        conseillerNumeriqueIdPg: null,
      },
    })
    changes.coordinateurUpdated = true
  }
  // Note: We don't remove Coordinateur role if they are no longer coordo in API
  // as per specs we only ADD roles, not remove them for coordinateur

  return {
    success: true,
    noOp: false,
    changes,
  }
}
