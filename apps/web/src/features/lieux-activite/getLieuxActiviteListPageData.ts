import { lieuxForListSelect } from '@app/web/features/mon-reseau/use-cases/lieux/db/searchLieux'
import { prismaClient } from '@app/web/prismaClient'

export const getLieuxActiviteListPageData = async ({
  mediateurId,
}: {
  mediateurId: string
}) =>
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
      debut: true,
      fin: true,
      structure: {
        select: lieuxForListSelect,
      },
    },
  })

export type LieuxActiviteListPageData = Awaited<
  ReturnType<typeof getLieuxActiviteListPageData>
>
