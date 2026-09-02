import { prismaClient } from '@app/web/prismaClient'
import type { Prisma } from '@prisma/client'
import { type LieuActiviteOption, optionDeLieu } from './option-de-lieu'

export const mediateurStructureSelect = () =>
  ({
    nom: true,
    id: true,
    adresse: true,
    codePostal: true,
    commune: true,
    activitesCount: true,
  }) satisfies Prisma.LieuInclusionSelect

export const getLieuxActiviteOptions = async (): Promise<
  LieuActiviteOption[]
> => {
  const structureSelect = mediateurStructureSelect()

  const lieuxActivite = await prismaClient.mediateurEnActivite.findMany({
    where: {
      suppression: null,
      fin: null,
    },
    select: {
      id: true,
      lieuInclusion: { select: structureSelect },
    },
    distinct: ['structureId'],
    orderBy: [
      { lieuInclusion: { activitesCount: 'desc' } },
      { lieuInclusion: { nom: 'asc' } },
    ],
  })

  return lieuxActivite.map(
    (
      {
        lieuInclusion: {
          id,
          nom,
          commune,
          codePostal,
          adresse,
          activitesCount,
        },
      },
      index,
    ) =>
      ({
        value: id,
        label: nom,
        extra: {
          nom,
          adresse: `${adresse}, ${codePostal} ${commune}`,
          activites: activitesCount,
          mostUsed: index === 0 && activitesCount > 0,
        },
      }) satisfies LieuActiviteOption,
  )
}
