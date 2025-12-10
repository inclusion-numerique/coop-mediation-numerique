import { findOrCreateStructure } from '@app/web/features/structures/findOrCreateStructure'
import { fetchSiretApiData } from '@app/web/features/structures/siret/fetchSiretData'
import { prismaClient } from '@app/web/prismaClient'

/**
 * Import structure employeuse from SIRET only (using API Entreprise)
 * Creates emploi with today's date as creation date
 * Gracefully handles API errors - logs but doesn't throw
 */
export const importStructureEmployeuseFromSiret = async ({
  userId,
  siret,
}: {
  userId: string
  siret: string
}): Promise<{ structureId: string } | null> => {
  // Fetch full SIRET data from API Entreprise
  const siretResult = await fetchSiretApiData(siret)

  // Handle API errors gracefully
  if ('error' in siretResult) {
    // biome-ignore lint/suspicious/noConsole: Intentional error logging
    console.error(
      `Failed to fetch SIRET data for ${siret}:`,
      siretResult.error.statusCode,
      siretResult.error.message,
    )
    return null
  }

  const {
    data: {
      unite_legale: { personne_morale_attributs },
      etat_administratif,
      adresse,
    },
  } = siretResult

  // Validate that it's a personne morale with a name
  if (!personne_morale_attributs?.raison_sociale) {
    // biome-ignore lint/suspicious/noConsole: Intentional error logging
    console.error(
      `SIRET ${siret} does not correspond to a personne morale with raison sociale`,
    )
    return null
  }

  // Skip closed establishments
  if (etat_administratif === 'F') {
    // biome-ignore lint/suspicious/noConsole: Intentional error logging
    console.error(`Establishment ${siret} is closed`)
    return null
  }

  // Build full address string
  const adresseComplete = [
    adresse.numero_voie,
    adresse.indice_repetition_voie,
    adresse.type_voie,
    adresse.libelle_voie,
    adresse.complement_adresse,
  ]
    .filter(Boolean)
    .join(' ')

  // Use API Entreprise data to find or create structure
  const structure = await findOrCreateStructure({
    siret,
    nom: personne_morale_attributs.raison_sociale,
    adresse: adresseComplete,
    codePostal: adresse.code_postal,
    codeInsee: adresse.code_commune || '',
    commune: adresse.libelle_commune || '',
  })

  // Check if emploi already exists
  const existingEmploi = await prismaClient.employeStructure.findFirst({
    where: {
      userId,
      structureId: structure.id,
    },
    select: {
      id: true,
    },
  })

  if (existingEmploi) {
    // Emploi already exists, return structure id
    return { structureId: structure.id }
  }

  // Create new emploi with today's date
  await prismaClient.employeStructure.create({
    data: {
      userId,
      structureId: structure.id,
      creation: new Date(),
      suppression: null,
    },
  })

  return { structureId: structure.id }
}
