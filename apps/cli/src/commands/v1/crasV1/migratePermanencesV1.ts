import { output } from '@app/cli/output'
import { prismaClient } from '@app/web/prismaClient'
import { numberToPercentage, numberToString } from '@app/web/utils/formatNumber'
import { v4 } from 'uuid'
import { chunk } from 'lodash-es'
import { PermanenceV1Document } from './PermanenceV1Document'

const findExistingPermanence = async ({
  permanence,
}: { permanence: PermanenceV1Document }) => {
  // Use adresse.codeCommune as city code
  const codeCommune = permanence.adresse.codeCommune
  if (!codeCommune) {
    return null
  }

  const existingFromId = await prismaClient.structure.findFirst({
    where: {
      v1PermanenceId: permanence._id.toString(),
    },
  })

  if (existingFromId) {
    return existingFromId
  }

  const existingFromSiret = permanence.siret
    ? await prismaClient.structure.findFirst({
        where: {
          siret: permanence.siret,
          nom: { equals: permanence.nomEnseigne, mode: 'insensitive' },
          codeInsee: codeCommune,
        },
      })
    : null

  if (existingFromSiret) {
    return existingFromSiret
  }

  // If the permanence has no address, it is not possible to be sure that it already exists
  const adresseString = permanence.adresse.numeroRue
    ? `${permanence.adresse.numeroRue} ${permanence.adresse.rue}`
    : permanence.adresse.rue

  if (!adresseString) {
    return null
  }

  const existingFromAdresse = await prismaClient.structure.findFirst({
    where: {
      nom: { equals: permanence.nomEnseigne, mode: 'insensitive' },
      adresse: {
        equals: adresseString,
        mode: 'insensitive',
      },
      codeInsee: codeCommune,
    },
  })

  return existingFromAdresse
}

const findCartographieNationaleStructure = async ({
  permanence,
}: { permanence: PermanenceV1Document }) => {
  if (!permanence.siret) {
    return null
  }

  return prismaClient.structureCartographieNationale.findFirst({
    where: {
      pivot: permanence.siret,
      nom: { equals: permanence.nomEnseigne, mode: 'insensitive' },
    },
  })
}

const migratePermanenceV1 = async ({
  permanence,
}: { permanence: PermanenceV1Document }) => {
  // we search in our database if the permanence already exists
  const existingStructure = await findExistingPermanence({
    permanence,
  })

  // If structure exists in our database, we update it
  if (existingStructure) {
    await prismaClient.structure.update({
      where: {
        id: existingStructure.id,
      },
      data: {
        v1PermanenceId: permanence._id.toString(),
      },
    })

    return
  }

  // we search in cartographie-nationale if the structure already exists
  const existingStructureFromCartographieNationale =
    await findCartographieNationaleStructure({ permanence })

  // Build address string
  const adresseString = permanence.adresse.numeroRue
    ? `${permanence.adresse.numeroRue} ${permanence.adresse.rue}`
    : permanence.adresse.rue

  // Create the structure in our database
  await prismaClient.structure.create({
    data: {
      id: v4(),
      nom: permanence.nomEnseigne,
      structureCartographieNationaleId:
        existingStructureFromCartographieNationale?.id,
      commune: permanence.adresse.ville,
      codePostal: permanence.adresse.codePostal,
      adresse: adresseString,
      latitude:
        typeof permanence.location.coordinates[1] === 'number'
          ? permanence.location.coordinates[1]
          : Number(permanence.location.coordinates[1]),
      longitude:
        typeof permanence.location.coordinates[0] === 'number'
          ? permanence.location.coordinates[0]
          : Number(permanence.location.coordinates[0]),
      codeInsee: permanence.adresse.codeCommune,
      siret: permanence.siret,
      v1PermanenceId: permanence._id.toString(),
      v1Imported: new Date(),
    },
  })
}

const batchSize = 10
export const migratePermanencesV1 = async ({
  permanences,
}: { permanences: PermanenceV1Document[] }) => {
  const chunks = chunk(permanences, batchSize)

  for (const chunkIndex in chunks) {
    const chunk = chunks[chunkIndex]
    await Promise.all(
      chunk.map((permanence) => migratePermanenceV1({ permanence })),
    )

    const done = Number(chunkIndex) * batchSize + chunk.length
    output(
      `Migrated ${numberToString(done)}/${numberToString(permanences.length)} (${numberToPercentage((100 * done) / permanences.length)}) permanences`,
    )
  }
}
