import { prismaClient } from '@app/web/prismaClient'

export const getLieuxActivite = async (mediateurId: string) =>
  prismaClient.mediateurEnActivite.findMany({
    where: {
      mediateurId,
      suppression: null,
      fin: null,
    },
    select: {
      id: true,
      creation: true,
      modification: true,
      structure: {
        select: {
          id: true,
          nom: true,
          adresse: true,
          commune: true,
          codePostal: true,
          codeInsee: true,
          complementAdresse: true,
          visiblePourCartographieNationale: true,
          structureCartographieNationaleId: true,
          siret: true,
          rna: true,
          typologies: true,
          _count: {
            select: {
              mediateursEnActivite: true,
            },
          },
        },
      },
    },
  })
