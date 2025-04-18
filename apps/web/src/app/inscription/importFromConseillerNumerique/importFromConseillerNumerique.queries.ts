import type { ConseillerNumeriqueV1Data } from '@app/web/external-apis/conseiller-numerique/ConseillerNumeriqueV1Data'
import type { MiseEnRelationConseillerNumeriqueV1MinimalProjection } from '@app/web/external-apis/conseiller-numerique/MiseEnRelationConseillerNumeriqueV1'
import { prismaClient } from '@app/web/prismaClient'
import { type Prisma } from '@prisma/client'
import type { ObjectId } from 'mongodb'
import { v4 } from 'uuid'

export const toId = ({ id }: { id: string | ObjectId }) => id.toString()

export type MiseEnRelationWithStructureAdministrativeInfo = {
  structureObj: Pick<
    MiseEnRelationConseillerNumeriqueV1MinimalProjection['structureObj'],
    'siret' | 'nom' | 'contact'
  > & {
    adresseInsee2Ban: Pick<
      MiseEnRelationConseillerNumeriqueV1MinimalProjection['structureObj']['adresseInsee2Ban'],
      'city' | 'postcode' | 'name' | 'y' | 'x' | 'citycode'
    >
  }
}

export const findConseillerNumeriquesFromConseillersCoordonnesV1 = ({
  conseillersCoordonnes,
}: ConseillerNumeriqueV1Data) =>
  !!conseillersCoordonnes && conseillersCoordonnes.length > 0
    ? prismaClient.conseillerNumerique.findMany({
        where: { id: { in: conseillersCoordonnes.map(toId) } },
      })
    : Promise.resolve([])

export const findExistingStructureForMiseEnRelationActive = ({
  miseEnRelationActive,
}: {
  miseEnRelationActive: MiseEnRelationWithStructureAdministrativeInfo
}) =>
  miseEnRelationActive
    ? prismaClient.structure.findFirst({
        where: {
          siret: miseEnRelationActive.structureObj.siret,
          nom: miseEnRelationActive.structureObj.nom,
        },
        select: {
          id: true,
          structureCartographieNationaleId: true,
          nomReferent: true,
        },
      })
    : null

export const findStructureCartographieNationaleFromMiseEnRelation = ({
  structureObj,
}: MiseEnRelationWithStructureAdministrativeInfo) =>
  prismaClient.structureCartographieNationale.findFirst({
    where: {
      pivot: structureObj.siret,
      nom: structureObj.nom,
    },
  })

export const createStructureEmployeuseFor =
  ({
    miseEnRelationActive: {
      structureObj: { nom, adresseInsee2Ban, siret, contact },
    },
  }: {
    miseEnRelationActive: MiseEnRelationWithStructureAdministrativeInfo
  }) =>
  (structureCartographieNationale: { id: string } | null) =>
    prismaClient.structure.create({
      data: {
        id: v4(),
        nom,
        structureCartographieNationaleId: structureCartographieNationale?.id,
        commune: adresseInsee2Ban?.city ?? '',
        codePostal: adresseInsee2Ban?.postcode ?? '',
        adresse: adresseInsee2Ban?.name ?? '',
        latitude: adresseInsee2Ban?.y,
        longitude: adresseInsee2Ban?.x,
        codeInsee: adresseInsee2Ban?.citycode,
        siret,
        nomReferent: `${contact?.prenom} ${contact?.nom}`,
        courrielReferent: contact?.email,
        telephoneReferent: contact?.telephone,
      },
    })

/**
 * This attaches our data to a list of v1 permanences
 */
export const findExistingStructuresCartoFromPermanencesV1 = async ({
  permanences,
}: Pick<ConseillerNumeriqueV1Data, 'permanences'>) => {
  const structuresCarto =
    await prismaClient.structureCartographieNationale.findMany({
      where: {
        conseillerNumeriquePermanenceIds: {
          hasSome: permanences.map((permanence) => permanence._id.toString()),
        },
      },
      include: { structures: { select: { id: true } } },
    })

  // We create an object with {permanence, structureCarto, structure} for each permanence
  return permanences.map((permanence) => {
    const permanenceId = permanence._id.toString('hex')
    const structureCarto = structuresCarto.find((existingStructureCarto) =>
      existingStructureCarto.conseillerNumeriquePermanenceIds.includes(
        permanenceId,
      ),
    )

    return {
      permanence,
      structureCarto,
      structure: structureCarto?.structures.at(0) ?? null,
    }
  })
}

export type ExistingStructuresCartoFromPermanencesV1 = Awaited<
  ReturnType<typeof findExistingStructuresCartoFromPermanencesV1>
>
export type ExistingStructureCartoFromPermanencesV1 =
  ExistingStructuresCartoFromPermanencesV1[number]

export const createStructures = async (
  structuresToCreate: Prisma.StructureCreateManyInput[],
) => prismaClient.structure.createMany({ data: structuresToCreate })

export const upsertMediateurEnActivite = async ({
  mediateurId,
  structureId,
}: {
  mediateurId: string
  structureId: string
}) => {
  const existing = await prismaClient.mediateurEnActivite.findFirst({
    where: {
      mediateurId,
      structureId,
    },
  })

  if (existing) {
    return existing
  }

  return prismaClient.mediateurEnActivite.create({
    data: {
      id: v4(),
      mediateurId,
      structureId,
    },
  })
}

export const createMediateurEnActivites = ({
  mediateurId,
  structureIds,
}: {
  mediateurId: string
  structureIds: string[]
}) =>
  Promise.all(
    structureIds.map((structureId) =>
      upsertMediateurEnActivite({
        mediateurId,
        structureId,
      }),
    ),
  )

export const findCoordinateursFor = ({
  conseiller: { coordinateurs },
}: ConseillerNumeriqueV1Data) => {
  if (!coordinateurs || coordinateurs.length === 0) {
    return []
  }

  return prismaClient.coordinateur.findMany({
    where: {
      conseillerNumeriqueId: { in: coordinateurs?.map(toId) },
    },
  })
}

export const upsertMediateurCoordonne = async ({
  mediateurId,
  coordinateurId,
}: {
  mediateurId: string
  coordinateurId: string
}) => {
  const existing = await prismaClient.mediateurCoordonne.findFirst({
    where: {
      mediateurId,
      coordinateurId,
    },
  })

  if (existing) {
    return existing
  }

  return await prismaClient.mediateurCoordonne.upsert({
    where: {
      coordinateurId_mediateurId: {
        mediateurId,
        coordinateurId,
      },
    },
    create: {
      id: v4(),
      mediateurId,
      coordinateurId,
    },
    update: {
      suppression: null,
    },
  })
}

export const upsertCoordinationsForMediateur = ({
  mediateurId,
  coordinateurIds,
}: {
  mediateurId: string
  coordinateurIds: string[]
}) =>
  Promise.all(
    coordinateurIds.map((coordinateurId) =>
      upsertMediateurCoordonne({
        mediateurId,
        coordinateurId,
      }),
    ),
  )

export const upsertCoordinationsForCoordinateur = ({
  coordinateurId,
  mediateurIds,
}: {
  coordinateurId: string
  mediateurIds: string[]
}) =>
  Promise.all(
    mediateurIds.map((mediateurId) =>
      upsertMediateurCoordonne({
        mediateurId,
        coordinateurId,
      }),
    ),
  )
