import type {
  DataspaceContrat,
  DataspaceLieuActivite,
  DataspaceMediateur,
  DataspaceStructureEmployeuse,
} from '@app/web/external-apis/dataspace/dataspaceApiClient'
import { findOrCreateStructure } from '@app/web/features/structures/findOrCreateStructure'
import { prismaClient } from '@app/web/prismaClient'
import { v4 } from 'uuid'

/**
 * Core sync logic shared between initializeInscription and updateUserFromDataspaceData
 *
 * Business Rules:
 * - Dataspace null response → NO-OP
 * - is_conseiller_numerique: true → Dataspace is source of truth for emplois/structures
 * - is_conseiller_numerique: false → Local is source of truth, only update flag
 * - is_coordinateur: true → Create Coordinateur (never delete)
 * - lieux_activite exists AND is_conseiller_numerique: true → Create Mediateur (never delete)
 */

// ============================================================================
// Types
// ============================================================================

export type SyncFromDataspaceCoreResult = {
  mediateurId: string | null
  coordinateurId: string | null
  structuresSynced: number
  structuresRemoved: number
  mediateurCreated: boolean
  coordinateurCreated: boolean
  lieuxActiviteSynced: number
}

export type SyncChanges = {
  conseillerNumeriqueCreated: boolean
  conseillerNumeriqueRemoved: boolean
  coordinateurCreated: boolean
  coordinateurUpdated: boolean
  mediateurCreated: boolean
  structuresSynced: number
  structuresRemoved: number
  lieuxActiviteSynced: number
}

type PreparedStructure = {
  structureId: string
  contracts: DataspaceContrat[]
  contract: DataspaceContrat | null
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Build full address from Dataspace address format
 */
export const buildAdresseFromDataspace = (adresse: {
  numero_voie: number | null
  nom_voie: string
  repetition: string | null
}): string => {
  const parts: string[] = []

  if (adresse.numero_voie) {
    parts.push(adresse.numero_voie.toString())
  }

  if (adresse.repetition) {
    parts.push(adresse.repetition)
  }

  parts.push(adresse.nom_voie)

  return parts.join(' ').trim()
}

/**
 * Get the active or most recent contract from a list of contracts
 */
export const getActiveOrMostRecentContract = (
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
export const getEmploiEndDate = (contrat: DataspaceContrat): Date | null => {
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
export const prepareStructuresFromDataspace = async (
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

// ============================================================================
// Core Sync Operations
// ============================================================================

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
export const syncStructuresEmployeusesFromDataspace = async ({
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
  const structureIds = preparedStructures.map(
    (preparedStructure) => preparedStructure.structureId,
  )

  // Step 2: Perform all EmployeStructure operations in a single transaction
  const result = await prismaClient.$transaction(async (transaction) => {
    let removedCount = 0

    // Get all existing emplois for this user
    const existingEmplois = await transaction.employeStructure.findMany({
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
      existingEmplois.map((emploi) => [emploi.structureId, emploi]),
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
            await transaction.employeStructure.update({
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
          await transaction.employeStructure.create({
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
            await transaction.employeStructure.update({
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
          await transaction.employeStructure.create({
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
    const deleteResult = await transaction.employeStructure.deleteMany({
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
 * Create Coordinateur if not exists (never delete)
 * Only creates if is_coordinateur is true from Dataspace
 */
export const upsertCoordinateur = async ({
  userId,
}: {
  userId: string
}): Promise<{ coordinateurId: string; created: boolean }> => {
  const existingCoordinateur = await prismaClient.coordinateur.findUnique({
    where: { userId },
    select: { id: true },
  })

  if (existingCoordinateur) {
    return { coordinateurId: existingCoordinateur.id, created: false }
  }

  // Create new coordinateur
  const newCoordinateur = await prismaClient.coordinateur.create({
    data: {
      userId,
    },
    select: { id: true },
  })

  return { coordinateurId: newCoordinateur.id, created: true }
}

/**
 * Create Mediateur if not exists (never delete)
 * Only creates if lieux_activite has items from Dataspace
 */
export const upsertMediateur = async ({
  userId,
}: {
  userId: string
}): Promise<{ mediateurId: string; created: boolean }> => {
  const existingMediateur = await prismaClient.mediateur.findUnique({
    where: { userId },
    select: { id: true },
  })

  if (existingMediateur) {
    return { mediateurId: existingMediateur.id, created: false }
  }

  // Create new mediateur
  const newMediateur = await prismaClient.mediateur.create({
    data: {
      userId,
    },
    select: { id: true },
  })

  return { mediateurId: newMediateur.id, created: true }
}

/**
 * Import lieux d'activité from Dataspace data for a mediateur
 * Creates MediateurEnActivite links for each lieu
 */
export const syncLieuxActiviteFromDataspace = async ({
  mediateurId,
  lieuxActivite,
}: {
  mediateurId: string
  lieuxActivite: DataspaceLieuActivite[]
}): Promise<{ structureIds: string[] }> => {
  const structureIds: string[] = []

  for (const lieuActivite of lieuxActivite) {
    // Some lieux activite from dataspace are lacking required data, we ignore them :
    // e.g :     {
    //   "nom": "Médiathèque de Saint-Quentin-la-Poterie",
    //   "siret": null,
    //   "adresse": {
    //     "nom_voie": null,
    //     "code_insee": null,
    //     "repetition": null,
    //     "code_postal": null,
    //     "nom_commune": null,
    //     "numero_voie": null
    //   },
    //   "contact": null
    // },

    if (
      !lieuActivite.adresse.code_insee ||
      !lieuActivite.adresse.code_postal ||
      !lieuActivite.adresse.nom_commune ||
      !lieuActivite.adresse.nom_voie.trim()
    ) {
      continue
    }

    const adresse = buildAdresseFromDataspace(lieuActivite.adresse)

    // Find or create structure
    const structure = await findOrCreateStructure({
      siret: lieuActivite.siret,
      nom: lieuActivite.nom,
      adresse,
      codePostal: lieuActivite.adresse.code_postal,
      codeInsee: lieuActivite.adresse.code_insee,
      commune: lieuActivite.adresse.nom_commune,
      nomReferent: lieuActivite.contact
        ? `${lieuActivite.contact.prenom} ${lieuActivite.contact.nom}`.trim()
        : null,
      courrielReferent:
        lieuActivite.contact?.courriels?.mail_gestionnaire ??
        lieuActivite.contact?.courriels?.mail_pro ??
        null,
      telephoneReferent: lieuActivite.contact?.telephone ?? null,
    })

    structureIds.push(structure.id)

    // Create mediateurEnActivite link if not exists
    const existingActivite = await prismaClient.mediateurEnActivite.findFirst({
      where: {
        mediateurId,
        structureId: structure.id,
        suppression: null,
        fin: null,
      },
      select: {
        id: true,
      },
    })

    if (!existingActivite) {
      await prismaClient.mediateurEnActivite.create({
        data: {
          id: v4(),
          mediateurId,
          structureId: structure.id,
          debut: new Date(),
        },
      })
    }
  }

  return { structureIds }
}

// ============================================================================
// Main Sync Core Function
// ============================================================================

/**
 * Core idempotent sync from Dataspace data
 *
 * This function handles:
 * 1. Coordinateur creation (only if is_coordinateur is true, never delete)
 * 2. Mediateur creation (only if lieux_activite exists AND is_conseiller_numerique is true, never delete)
 * 3. Structures employeuses sync (only if is_conseiller_numerique is true)
 * 4. Lieux d'activité sync (if mediateur, lieux_activite exist AND is_conseiller_numerique is true)
 *
 * @param userId - The user ID to sync
 * @param dataspaceData - The Dataspace API response (null = no-op)
 * @param wasConseillerNumerique - Previous CN status (for transition logic)
 */
export const syncFromDataspaceCore = async ({
  userId,
  dataspaceData,
  wasConseillerNumerique = false,
}: {
  userId: string
  dataspaceData: DataspaceMediateur | null
  wasConseillerNumerique?: boolean
}): Promise<{
  success: boolean
  noOp: boolean
  changes: SyncChanges
  mediateurId: string | null
  coordinateurId: string | null
}> => {
  const changes: SyncChanges = {
    conseillerNumeriqueCreated: false,
    conseillerNumeriqueRemoved: false,
    coordinateurCreated: false,
    coordinateurUpdated: false,
    mediateurCreated: false,
    structuresSynced: 0,
    structuresRemoved: 0,
    lieuxActiviteSynced: 0,
  }

  // Null response = NO-OP
  if (dataspaceData === null) {
    return {
      success: true,
      noOp: true,
      changes,
      mediateurId: null,
      coordinateurId: null,
    }
  }

  const isConseillerNumeriqueInApi = dataspaceData.is_conseiller_numerique
  const isCoordinateurInApi = dataspaceData.is_coordinateur
  const lieuxActivite = dataspaceData.lieux_activite ?? []
  const hasLieuxActivite = lieuxActivite.length > 0

  let mediateurId: string | null = null
  let coordinateurId: string | null = null

  // --- Update User base fields ---
  await prismaClient.user.update({
    where: { id: userId },
    data: {
      dataspaceId: dataspaceData.id,
      lastSyncedFromDataspace: new Date(),
      isConseillerNumerique: isConseillerNumeriqueInApi,
    },
  })

  // --- Coordinateur: Only create if is_coordinateur is true (never delete) ---
  if (isCoordinateurInApi && isConseillerNumeriqueInApi) {
    const {
      coordinateurId: upsertedCoordinateurId,
      created: coordinateurCreated,
    } = await upsertCoordinateur({
      userId,
    })
    coordinateurId = upsertedCoordinateurId
    if (coordinateurCreated) {
      changes.coordinateurCreated = true
    }
  }

  // --- Mediateur: Only create if lieux_activite exists AND is_conseiller_numerique (never delete) ---
  if (hasLieuxActivite && isConseillerNumeriqueInApi) {
    const { mediateurId: upsertedMediateurId, created: mediateurCreated } =
      await upsertMediateur({ userId })
    mediateurId = upsertedMediateurId
    if (mediateurCreated) {
      changes.mediateurCreated = true
    }

    // Sync lieux d'activité if mediateur exists
    const { structureIds: lieuxActiviteStructureIds } =
      await syncLieuxActiviteFromDataspace({
        mediateurId: upsertedMediateurId,
        lieuxActivite,
      })
    changes.lieuxActiviteSynced = lieuxActiviteStructureIds.length
  }

  // --- Conseiller Numérique Transitions (structures employeuses) ---
  if (isConseillerNumeriqueInApi) {
    // Dataspace is source of truth - sync structures
    if (!wasConseillerNumerique) {
      changes.conseillerNumeriqueCreated = true
    }

    const { structureIds, removed } =
      await syncStructuresEmployeusesFromDataspace({
        userId,
        structuresEmployeuses: dataspaceData.structures_employeuses ?? [],
      })
    changes.structuresSynced = structureIds.length
    changes.structuresRemoved = removed
  } else if (wasConseillerNumerique && !isConseillerNumeriqueInApi) {
    // Transition: Was CN, no longer is
    // Do ONE LAST sync to update contracts, then local becomes source of truth
    changes.conseillerNumeriqueRemoved = true

    const { structureIds, removed } =
      await syncStructuresEmployeusesFromDataspace({
        userId,
        structuresEmployeuses: dataspaceData.structures_employeuses ?? [],
      })
    changes.structuresSynced = structureIds.length
    changes.structuresRemoved = removed
  }
  // else: Not CN and not becoming CN → local is source of truth, don't touch emplois

  return {
    success: true,
    noOp: false,
    changes,
    mediateurId,
    coordinateurId,
  }
}
