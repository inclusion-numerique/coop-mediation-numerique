import type {
  DataspaceContrat,
  DataspaceStructureEmployeuse,
} from '@app/web/external-apis/dataspace/dataspaceApiClient'
import type { InitializeDebugLogger } from '@app/web/features/inscription/use-cases/initialize/initializeInscription'
import { findOrCreateStructure } from '@app/web/features/structures/findOrCreateStructure'
import { prismaClient } from '@app/web/prismaClient'

// No-op logger for when debug logging is not needed
const noopLogger: InitializeDebugLogger = () => {
  // Intentional no-op
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
 * Import structure employeuse from Dataspace API data
 * Uses the generic findOrCreateStructure helper
 * Creates emploi with contract dates (creation = date_debut, suppression = date_fin/date_rupture)
 */
export const importStructureEmployeuseFromDataspace = async ({
  userId,
  structureEmployeuse,
  log = noopLogger,
}: {
  userId: string
  structureEmployeuse: DataspaceStructureEmployeuse
  log?: InitializeDebugLogger
}): Promise<{ structureId: string }> => {
  const adresse = buildAdresseFromDataspace(structureEmployeuse.adresse)

  log('Building structure from Dataspace data', {
    siret: structureEmployeuse.siret,
    nom: structureEmployeuse.nom,
    adresse,
    codePostal: structureEmployeuse.adresse.code_postal,
    codeInsee: structureEmployeuse.adresse.code_insee,
    commune: structureEmployeuse.adresse.nom_commune,
    hasContact: !!structureEmployeuse.contact,
    contratsCount: structureEmployeuse.contrats?.length ?? 0,
  })

  // Use generic helper to find or create structure
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

  log('Structure found or created', { structureId: structure.id })

  // Get the active or most recent contract
  const contract = getActiveOrMostRecentContract(
    structureEmployeuse.contrats ?? [],
  )

  log('Contract analysis', {
    totalContrats: structureEmployeuse.contrats?.length ?? 0,
    selectedContract: contract
      ? {
          type: contract.type,
          dateDebut: contract.date_debut,
          dateFin: contract.date_fin,
          dateRupture: contract.date_rupture,
        }
      : null,
  })

  // Calculate dates from contract
  const creationDate = contract ? new Date(contract.date_debut) : new Date()
  const suppressionDate = contract ? getEmploiEndDate(contract) : null

  log('Emploi dates calculated', {
    creationDate: creationDate.toISOString(),
    suppressionDate: suppressionDate?.toISOString() ?? null,
  })

  // Check if emploi already exists
  const existingEmploi = await prismaClient.employeStructure.findFirst({
    where: {
      userId,
      structureId: structure.id,
    },
    select: {
      id: true,
      creation: true,
      suppression: true,
    },
  })

  if (existingEmploi) {
    log('Existing emploi found', {
      emploiId: existingEmploi.id,
      existingCreation: existingEmploi.creation.toISOString(),
      existingSuppression: existingEmploi.suppression?.toISOString() ?? null,
    })

    // Update existing emploi with contract dates if different
    if (
      existingEmploi.creation.getTime() !== creationDate.getTime() ||
      existingEmploi.suppression?.getTime() !== suppressionDate?.getTime()
    ) {
      log('Updating emploi dates', {
        emploiId: existingEmploi.id,
        oldCreation: existingEmploi.creation.toISOString(),
        newCreation: creationDate.toISOString(),
        oldSuppression: existingEmploi.suppression?.toISOString() ?? null,
        newSuppression: suppressionDate?.toISOString() ?? null,
      })

      await prismaClient.employeStructure.update({
        where: { id: existingEmploi.id },
        data: {
          creation: creationDate,
          suppression: suppressionDate,
        },
      })
    } else {
      log('Emploi dates unchanged, skipping update')
    }
  } else {
    log('Creating new emploi', {
      userId,
      structureId: structure.id,
      creation: creationDate.toISOString(),
      suppression: suppressionDate?.toISOString() ?? null,
    })

    // Create new emploi with contract dates
    await prismaClient.employeStructure.create({
      data: {
        userId,
        structureId: structure.id,
        creation: creationDate,
        suppression: suppressionDate,
      },
    })

    log('Emploi created successfully')
  }

  return { structureId: structure.id }
}

/**
 * Check if a contract is currently active
 */
const isContractActive = (contrat: DataspaceContrat): boolean => {
  const now = new Date()
  const dateDebut = new Date(contrat.date_debut)
  const dateFin = new Date(contrat.date_fin)
  const hasNotStarted = dateDebut > now
  const hasEnded = dateFin < now
  const isRuptured = contrat.date_rupture !== null

  return !hasNotStarted && !hasEnded && !isRuptured
}

/**
 * Get the primary structure employeuse from Dataspace data
 * (the one with an active contract, or the first one)
 */
export const getPrimaryStructureEmployeuse = (
  structuresEmployeuses: DataspaceStructureEmployeuse[],
): DataspaceStructureEmployeuse | null => {
  if (structuresEmployeuses.length === 0) {
    return null
  }

  // Find structure with active contract
  const withActiveContract = structuresEmployeuses.find(
    (structure) => structure.contrats?.some(isContractActive) ?? false,
  )

  return withActiveContract ?? structuresEmployeuses[0]
}
