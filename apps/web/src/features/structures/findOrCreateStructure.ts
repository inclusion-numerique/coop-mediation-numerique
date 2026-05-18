import { searchAdresse } from '@app/web/external-apis/apiAdresse'
import { banFeatureToAdresseBanData } from '@app/web/external-apis/ban/banFeatureToAdresseBanData'
import { prismaClient } from '@app/web/prismaClient'
import { toStructureFromCartoStructure } from '@app/web/structure/toStructureFromCartoStructure'
import { v4 } from 'uuid'

export type StructureInput = {
  coopId?: string | null
  siret: string | null
  nom: string
  adresse: string
  codePostal: string
  codeInsee: string
  commune: string
  // Optional fields
  nomReferent?: string | null
  courrielReferent?: string | null
  telephoneReferent?: string | null
  creationParId?: string | null
}

const findExistingBySiretOrNom = async ({
  siret,
  nom,
  codeInsee,
}: {
  siret: string | null
  nom: string
  codeInsee: string
}): Promise<{ id: string } | null> => {
  const where = siret
    ? { siret, codeInsee, suppression: null }
    : { nom, codeInsee, suppression: null }

  const existing = await prismaClient.structure.findFirst({
    where,
    select: { id: true, suppression: true },
    orderBy: { creation: 'desc' },
  })

  if (existing) {
    await undeleteStructureIfDeleted(
      existing as { id: string; suppression: Date | null },
    )
    return existing
  }

  return null
}

const undeleteStructureIfDeleted = async ({
  id,
  suppression,
}: {
  id: string
  suppression: Date | null
}) => {
  if (suppression) {
    await prismaClient.structure.update({
      where: { id },
      data: {
        suppression: null,
        suppressionParId: null,
      },
    })
  }
}

/**
 * Generic helper to find or create a structure following this hierarchy:
 * 1. Find existing Structure by coopId (surest match)
 * 2. Find existing Structure by SIRET + codeInsee
 * 3. Find StructureCartographieNationale by pivot (SIRET) → create Structure from it
 * 4. Find existing Structure by nom + codeInsee (if no SIRET)
 * 5. Fallback: Geocode via searchAdresse (BAN API) and create
 *
 * This is reusable for both V1 imports and Dataspace imports.
 */
export const findOrCreateStructure = async ({
  coopId,
  siret,
  nom,
  adresse,
  codePostal,
  codeInsee,
  commune,
  nomReferent,
  courrielReferent,
  telephoneReferent,
  creationParId,
}: StructureInput): Promise<{ id: string }> => {
  // If coopId is provided, it is the surest way to find the structure
  if (coopId) {
    const existingStructure = await prismaClient.structure.findFirst({
      where: {
        id: coopId,
      },
      select: {
        id: true,
        suppression: true,
      },
    })
    if (existingStructure) {
      await undeleteStructureIfDeleted(existingStructure)
      return existingStructure
    }
  }

  // Step 1: Find existing Structure by SIRET + codeInsee
  if (siret) {
    const existingStructure = await prismaClient.structure.findFirst({
      where: {
        siret,
        codeInsee,
        suppression: null,
      },
      select: {
        id: true,
        suppression: true,
      },
      orderBy: [
        {
          suppression: {
            sort: 'desc',
            nulls: 'last',
          },
        },
        {
          creation: 'desc',
        },
      ],
    })

    if (existingStructure) {
      await undeleteStructureIfDeleted(existingStructure)
      return existingStructure
    }
  }

  // Step 2: Find StructureCartographieNationale by pivot (SIRET) - only if siret is provided
  if (siret) {
    const cartoStructure =
      await prismaClient.structureCartographieNationale.findFirst({
        where: {
          pivot: siret,
          codeInsee,
        },
      })

    if (cartoStructure) {
      // Guard: re-check before creating to prevent duplicates
      const existing = await findExistingBySiretOrNom({ siret, nom, codeInsee })
      if (existing) return existing

      // Create structure from cartographie nationale data (has coordinates)
      const structureData = toStructureFromCartoStructure(cartoStructure)

      // Override with referent info if provided
      const createdStructure = await prismaClient.structure.create({
        data: {
          ...structureData,
          nomReferent: nomReferent ?? null,
          courrielReferent: courrielReferent ?? structureData.courriels?.at(0),
          telephoneReferent: telephoneReferent ?? structureData.telephone,
          creationParId,
        },
        select: {
          id: true,
        },
      })

      return createdStructure
    }
  }

  // Step 3: Try to find existing structure by nom if no siret
  if (!siret) {
    const existingByNom = await prismaClient.structure.findFirst({
      where: {
        nom,
        codeInsee,
      },
      select: {
        id: true,
        suppression: true,
      },
      orderBy: [
        {
          suppression: {
            sort: 'desc',
            nulls: 'last',
          },
        },
        {
          creation: 'desc',
        },
      ],
    })

    if (existingByNom) {
      await undeleteStructureIfDeleted(existingByNom)
      return existingByNom
    }
  }

  // Step 4: Fallback - geocode via BAN API and create
  // Guard: re-check before creating to prevent duplicates
  const existingGuard = await findExistingBySiretOrNom({
    siret,
    nom,
    codeInsee,
  })
  if (existingGuard) return existingGuard

  const fullAdresse = `${adresse}, ${codePostal} ${commune}`
  const adresseResult = await searchAdresse(fullAdresse)

  if (adresseResult) {
    const banData = banFeatureToAdresseBanData(adresseResult)

    return prismaClient.structure.create({
      data: {
        id: v4(),
        siret,
        nom,
        adresse: banData.nom,
        commune: banData.commune,
        codePostal: banData.codePostal,
        codeInsee: banData.codeInsee,
        latitude: banData.latitude,
        longitude: banData.longitude,
        nomReferent,
        courrielReferent,
        telephoneReferent,
        creationParId,
      },
      select: {
        id: true,
      },
    })
  }

  // No geocoding result - create without coordinates
  return prismaClient.structure.create({
    data: {
      id: v4(),
      siret,
      nom,
      adresse,
      commune,
      codePostal,
      codeInsee,
      nomReferent,
      courrielReferent,
      telephoneReferent,
      creationParId,
    },
    select: {
      id: true,
    },
  })
}
