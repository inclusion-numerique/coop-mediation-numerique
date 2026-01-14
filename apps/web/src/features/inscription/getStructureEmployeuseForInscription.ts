import { prismaClient } from '@app/web/prismaClient'

export const getStructureEmployeuseForInscription = ({
  userId,
}: {
  userId: string
}) =>
  prismaClient.employeStructure.findFirst({
    where: {
      userId,
      suppression: null,
      fin: null,
    },
    orderBy: {
      debut: 'desc',
    },
    select: {
      id: true,
      structure: {
        select: {
          id: true,
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
