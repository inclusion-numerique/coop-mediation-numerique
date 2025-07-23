import { output } from '@app/cli/output'
import { prismaClient } from '@app/web/prismaClient'
import { numberToPercentage, numberToString } from '@app/web/utils/formatNumber'
import { v4 } from 'uuid'
import { chunk } from 'lodash-es'
import { StructureV1Document } from './StructureV1Document'

const findExistingStructure = async ({
  structure,
}: { structure: StructureV1Document }) => {
  const existingFromId = await prismaClient.structure.findFirst({
    where: {
      v1StructureId: structure._id.toString(),
    },
  })

  if (existingFromId) {
    return existingFromId
  }

  // if structure has no citycode, return null as it is not possible to be sure that it already exists
  const codeCommune =
    structure.codeCommune ?? structure.adresseInsee2Ban?.citycode ?? null
  if (!codeCommune) {
    return null
  }

  const existingFromSiret = structure.siret
    ? await prismaClient.structure.findFirst({
        where: {
          siret: structure.siret,
          nom: { equals: structure.nom, mode: 'insensitive' },
          codeInsee: codeCommune,
        },
      })
    : null

  if (existingFromSiret) {
    return existingFromSiret
  }

  // If the structure has no address name, it is not possible to be sure that it already exists
  if (!structure.adresseInsee2Ban?.name) {
    return null
  }

  const existingFromAdresse = await prismaClient.structure.findFirst({
    where: {
      nom: { equals: structure.nom, mode: 'insensitive' },
      adresse: {
        equals: structure.adresseInsee2Ban.name,
        mode: 'insensitive',
      },
      codeInsee: codeCommune,
    },
  })

  return existingFromAdresse
}

const findCartographieNationaleStructure = async ({
  structure,
}: { structure: StructureV1Document }) => {
  if (!structure.siret) {
    return null
  }

  return prismaClient.structureCartographieNationale.findFirst({
    where: {
      pivot: structure.siret,
      nom: { equals: structure.nom, mode: 'insensitive' },
    },
  })
}

const migrateStructureV1 = async ({
  structure,
}: { structure: StructureV1Document }) => {
  // we search in our database if the structure already exists
  const existingStructure = await findExistingStructure({
    structure,
  })

  // If structure exists in our database, we update it
  if (existingStructure) {
    await prismaClient.structure.update({
      where: {
        id: existingStructure.id,
      },
      data: {
        v1StructureId: structure._id.toString(),
        v1StructureIdPg: structure.idPG,
      },
    })

    return
  }

  // we search in cartographie-nationale if the structure already exists
  const existingStructureFromCartographieNationale =
    await findCartographieNationaleStructure({ structure })

  // Create the structure in our database
  await prismaClient.structure.create({
    data: {
      id: v4(),
      nom: structure.nom,
      structureCartographieNationaleId:
        existingStructureFromCartographieNationale?.id,
      commune: structure.adresseInsee2Ban?.city ?? '',
      codePostal: structure.adresseInsee2Ban?.postcode ?? '',
      adresse: structure.adresseInsee2Ban?.name ?? '',
      latitude: structure.location.coordinates[1],
      longitude: structure.location.coordinates[0],
      codeInsee: structure.codeCommune ?? structure.adresseInsee2Ban?.citycode,
      siret: structure.siret,
      nomReferent: `${structure.contact?.prenom} ${structure.contact?.nom}`,
      courrielReferent: structure.contact?.email,
      telephoneReferent: structure.contact?.telephone,
      v1Imported: new Date(),
      v1StructureId: structure._id.toString(),
      v1StructureIdPg: structure.idPG,
    },
  })
}

const batchSize = 10
export const migrateStructuresV1 = async ({
  structures,
}: { structures: StructureV1Document[] }) => {
  const chunks = chunk(structures, batchSize)

  for (const chunkIndex in chunks) {
    const chunk = chunks[chunkIndex]
    await Promise.all(
      chunk.map((structure) => migrateStructureV1({ structure })),
    )

    const done = Number(chunkIndex) * batchSize + chunk.length
    output(
      `Migrated ${numberToString(done)}/${numberToString(structures.length)} (${numberToPercentage((100 * done) / structures.length)}) structures`,
    )
  }
}
