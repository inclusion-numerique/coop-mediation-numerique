import { StructureData } from '@app/web/features/structures/StructureValidation'
import { prismaClient } from '@app/web/prismaClient'

export const getLieuxActiviteForInscription = async ({
  mediateurId,
}: {
  mediateurId: string
}) => {
  const enActivite = await prismaClient.mediateurEnActivite.findMany({
    where: {
      mediateurId,
      suppression: null,
      fin: null,
    },
    orderBy: {
      debut: 'asc',
    },
    select: {
      id: true,
      structure: {
        select: {
          id: true,
          structureCartographieNationaleId: true,
          nom: true,
          commune: true,
          codePostal: true,
          codeInsee: true,
          siret: true,
          rna: true,
          adresse: true,
          complementAdresse: true,
          typologies: true,
        },
      },
    },
  })

  const lieuxActivite: StructureData[] = enActivite.map(
    (lieuActivite) => lieuActivite.structure,
  )

  return lieuxActivite
}
