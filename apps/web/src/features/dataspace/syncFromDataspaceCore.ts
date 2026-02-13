import type {
  DataspaceContrat,
  DataspaceLieuActivite,
  DataspaceMediateur,
  DataspaceStructureEmployeuse,
} from '@app/web/external-apis/dataspace/dataspaceApiClient'
import { getContractStatus } from '@app/web/features/dataspace/getContractStatus'
import { findOrCreateStructure } from '@app/web/features/structures/findOrCreateStructure'
import { prismaClient } from '@app/web/prismaClient'
import { dateAsIsoDay } from '@app/web/utils/dateAsIsoDay'
import { v4 } from 'uuid'

/**
 * Core sync logic shared between initializeInscription and updateUserFromDataspaceData
 *
 * Business Rules:
 * - Dataspace null response → NO-OP
 * - is_conseiller_numerique: true → Dataspace is source of truth for emplois/structures
 * - is_conseiller_numerique: false → Local is source of truth, only update flag
 * - is_coordinateur: true → Create Coordinateur (never delete)
 * - Lieux d'activité: NOT synced here (only imported once during inscription)
 */

// ============================================================================
// Types
// ============================================================================

export type SyncFromDataspaceCoreResult = {
  coordinateurId: string | null
  structuresSynced: number
  structuresRemoved: number
  coordinateurCreated: boolean
}

export type SyncChanges = {
  conseillerNumeriqueCreated: boolean
  conseillerNumeriqueRemoved: boolean
  coordinateurCreated: boolean
  coordinateurUpdated: boolean
  structuresSynced: number
  structuresRemoved: number
}

/**
 * Represents a single contract with its structure, ready for sync
 * One EmployeStructure record will be created for each PreparedContract
 */
type PreparedContract = {
  structureId: string
  contract: DataspaceContrat
}

type ExistingEmploiForSync = {
  id: string
  structureId: string
  debut: Date | null
  fin: Date | null
  suppression: Date | null
  creation: Date
}

const hasDebutDate = (
  emploi: ExistingEmploiForSync,
): emploi is ExistingEmploiForSync & { debut: Date } => emploi.debut !== null

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Build full address from Dataspace address format
 */
export const buildAdresseFromDataspace = (adresse: {
  numero_voie: number | null
  nom_voie: string | null
  repetition: string | null
}): string => {
  const parts: string[] = []

  if (adresse.numero_voie) {
    parts.push(adresse.numero_voie.toString())
  }

  if (adresse.repetition && adresse.repetition !== 'null') {
    parts.push(adresse.repetition)
  }

  if (adresse.nom_voie && adresse.nom_voie !== 'null') {
    parts.push(adresse.nom_voie)
  }

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
  const activeContract = contrats.find(
    (contrat) => getContractStatus({ contrat, date: now }).isActive,
  )

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
 * Only date_rupture from Dataspace is mapped to emploi fin.
 * date_fin does not impact emploi fin in our model.
 */
export const getEmploiEndDate = (contrat: DataspaceContrat): Date | null => {
  return contrat.date_rupture ? new Date(contrat.date_rupture) : null
}

/**
 * Prepare contract data from Dataspace for EmployeStructure sync
 * Returns one PreparedContract for each contract in each structure
 * Creates one EmployeStructure record per contract
 */
export const prepareContractsFromDataspace = async (
  structuresEmployeuses: DataspaceStructureEmployeuse[],
): Promise<PreparedContract[]> => {
  const prepared: PreparedContract[] = []

  for (const structureEmployeuse of structuresEmployeuses) {
    const contracts = structureEmployeuse.contrats ?? []

    // Skip structures without contracts
    if (contracts.length === 0) {
      continue
    }

    const adresse = buildAdresseFromDataspace(structureEmployeuse.adresse)

    // Find or create structure (outside transaction - structures are stable)
    const structure = await findOrCreateStructure({
      coopId: structureEmployeuse.ids?.coop,
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

    // Create one PreparedContract for each contract
    for (const contract of contracts) {
      prepared.push({
        structureId: structure.id,
        contract,
      })
    }
  }

  return prepared
}

const getOrCreateStructureIdForTemporaryContract = async ({
  structureEmployeuse,
}: {
  structureEmployeuse: DataspaceStructureEmployeuse
}): Promise<string> => {
  const adresse = buildAdresseFromDataspace(structureEmployeuse.adresse)
  const structure = await findOrCreateStructure({
    coopId: structureEmployeuse.ids?.coop,
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

  return structure.id
}

// ============================================================================
// Core Sync Operations
// ============================================================================

/**
 * Generate a unique key for an emploi based on structureId and debut date
 * Used to match existing emplois with contracts from Dataspace
 */
const getEmploiKey = (structureId: string, debut: Date): string =>
  `${structureId}:${dateAsIsoDay(debut)}`

/**
 * Sync ALL contracts from Dataspace data as EmployeStructure records
 * After sync, user has exactly one EmployeStructure for each contract in Dataspace.
 * - Creates EmployeStructure for each contract in Dataspace
 * - Updates existing EmployeStructure if fin date changed
 * - Soft-deletes EmployeStructure records for contracts NOT in Dataspace
 * - If structures exist but no valid contracts remain after filtering,
 *   one temporary emploi is kept/created with debut=null and fin=null
 *
 * Matching logic: An emploi is matched to a contract by structureId + debut date
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
  // Step 1: Prepare all contracts (find/create structures) outside transaction
  // This already filters out structures without contracts
  const preparedContracts = await prepareContractsFromDataspace(
    structuresEmployeuses,
  )

  const temporaryContractStructureId =
    preparedContracts.length === 0 && structuresEmployeuses.length > 0
      ? await getOrCreateStructureIdForTemporaryContract({
          structureEmployeuse: structuresEmployeuses[0],
        })
      : null

  // Collect unique structure IDs for the return value
  const structureIds = [
    ...new Set(
      [
        ...preparedContracts.map((pc) => pc.structureId),
        temporaryContractStructureId,
      ].filter((structureId) => typeof structureId === 'string'),
    ),
  ]

  // Step 2: Perform all EmployeStructure operations in a single transaction
  const result = await prismaClient.$transaction(async (transaction) => {
    // Get all existing emplois for this user (including soft-deleted for reactivation)
    const existingEmplois: ExistingEmploiForSync[] =
      await transaction.employeStructure.findMany({
        where: { userId },
        select: {
          id: true,
          structureId: true,
          debut: true,
          fin: true,
          suppression: true,
          creation: true,
        },
      })

    // Create a map for quick lookup by structureId + debut for real contracts.
    // Temporary contracts use debut=null and are handled separately.
    const emploisByKey = new Map(
      existingEmplois
        .filter(hasDebutDate)
        .map((emploi) => [
          getEmploiKey(emploi.structureId, emploi.debut),
          emploi,
        ]),
    )

    const temporaryEmplois = existingEmplois
      .filter((emploi) => emploi.debut === null)
      .toSorted((a, b) => a.creation.getTime() - b.creation.getTime())

    // Track which emploi IDs should remain active after sync
    const emploiIdsToKeep: string[] = []

    // Process each contract from Dataspace
    for (const { structureId, contract } of preparedContracts) {
      const creationDate = new Date(contract.date_debut)
      const endDate = getEmploiEndDate(contract)
      const key = getEmploiKey(structureId, creationDate)

      const existingEmploi = emploisByKey.get(key)

      if (existingEmploi) {
        emploiIdsToKeep.push(existingEmploi.id)

        // Check if we need to update the emploi
        const needsUpdate =
          existingEmploi.fin?.getTime() !== endDate?.getTime() ||
          existingEmploi.suppression !== null // Reactivate if it was soft-deleted

        if (needsUpdate) {
          await transaction.employeStructure.update({
            where: { id: existingEmploi.id },
            data: {
              fin: endDate,
              // Contracts present in Dataspace are never soft-deleted.
              suppression: null,
            },
          })
        }
      } else {
        // Create new emploi for this contract
        const newEmploi = await transaction.employeStructure.create({
          data: {
            userId,
            structureId,
            debut: creationDate,
            fin: endDate,
            suppression: null,
          },
          select: { id: true },
        })
        emploiIdsToKeep.push(newEmploi.id)
      }
    }

    // If Dataspace has structures but no valid contracts, keep exactly one
    // temporary contract (debut=null, fin=null) on the first structure.
    if (preparedContracts.length === 0 && temporaryContractStructureId) {
      const temporaryEmploiToKeep = temporaryEmplois[0]

      if (temporaryEmploiToKeep) {
        emploiIdsToKeep.push(temporaryEmploiToKeep.id)

        const needsUpdate =
          temporaryEmploiToKeep.structureId !== temporaryContractStructureId ||
          temporaryEmploiToKeep.fin !== null ||
          temporaryEmploiToKeep.suppression !== null

        if (needsUpdate) {
          await transaction.employeStructure.update({
            where: { id: temporaryEmploiToKeep.id },
            data: {
              structureId: temporaryContractStructureId,
              fin: null,
              suppression: null,
            },
          })
        }
      } else {
        const newTemporaryEmploi = await transaction.employeStructure.create({
          data: {
            userId,
            structureId: temporaryContractStructureId,
            debut: null,
            fin: null,
            suppression: null,
          },
          select: { id: true },
        })
        emploiIdsToKeep.push(newTemporaryEmploi.id)
      }
    }

    // Soft-delete EmployeStructure records for contracts NOT in Dataspace
    // Set suppression date to mark them as ended
    const now = new Date()
    const softDeleteResult = await transaction.employeStructure.updateMany({
      where: {
        userId,
        id: {
          notIn: emploiIdsToKeep,
        },
        suppression: null, // Only soft-delete those not already deleted
      },
      data: {
        suppression: now,
        fin: now,
      },
    })

    return { removedCount: softDeleteResult.count }
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
 * Only creates if explicitly called (typically during first-time lieux import)
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
 * Import lieux d'activité from Dataspace data for a mediateur (one-time import)
 * Creates MediateurEnActivite links for each lieu
 * This is NOT part of regular sync - only called during inscription
 */
export const importLieuxActiviteFromDataspace = async ({
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
      !lieuActivite.adresse.nom_voie ||
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
 * 2. Structures employeuses sync (only if is_conseiller_numerique is true)
 *
 * Note: Lieux d'activité are NOT synced here. They are only imported once during inscription.
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
  coordinateurId: string | null
}> => {
  const changes: SyncChanges = {
    conseillerNumeriqueCreated: false,
    conseillerNumeriqueRemoved: false,
    coordinateurCreated: false,
    coordinateurUpdated: false,
    structuresSynced: 0,
    structuresRemoved: 0,
  }

  // Null response = NO-OP
  if (dataspaceData === null) {
    return {
      success: true,
      noOp: true,
      changes,
      coordinateurId: null,
    }
  }

  const isConseillerNumeriqueInApi = dataspaceData.is_conseiller_numerique
  const isCoordinateurInApi = dataspaceData.is_coordinateur

  let coordinateurId: string | null = null

  // --- Update User base fields ---
  await prismaClient.user.update({
    where: { id: userId },
    data: {
      dataspaceId: dataspaceData.id,
      dataspaceUserIdPg: dataspaceData.pg_id,
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
    coordinateurId,
  }
}
