import type { SelectOption } from '@app/ui/components/Form/utils/options'
import { prismaClient } from '@app/web/prismaClient'
import type { Prisma } from '@prisma/client'

export const mediateurStructureSelect = () =>
  ({
    nom: true,
    id: true,
    adresse: true,
    codePostal: true,
    commune: true,
    activitesCount: true,
  }) satisfies Prisma.StructureSelect

export type LieuActiviteOption = SelectOption<
  string,
  {
    nom: string
    adresse: string
    activites: number
    mostUsed: boolean
  }
>

export const getMediateursLieuxActiviteOptions = async ({
  mediateurIds,
}: {
  mediateurIds: string[]
}): Promise<LieuActiviteOption[]> => {
  const structureSelect = mediateurStructureSelect()

  const lieuxActivite = await prismaClient.mediateurEnActivite.findMany({
    where: {
      mediateurId: { in: mediateurIds },
      suppression: null,
      fin: null,
    },
    select: {
      id: true,
      structure: { select: structureSelect },
    },
    distinct: ['structureId'],
    orderBy: [
      { structure: { activitesCount: 'desc' } },
      { structure: { nom: 'asc' } },
    ],
  })

  return lieuxActivite.map(
    (
      { structure: { id, nom, commune, codePostal, adresse, activitesCount } },
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
