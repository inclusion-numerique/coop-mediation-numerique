import { prismaClient } from '@app/web/prismaClient'
import { getTagScope } from '../tags/tagScope'

export const getActivitesTagsOptions = async (mediateurId: string) => {
  const tags = await prismaClient.tag.findMany({
    where: {
      activites: {
        some: {
          activite: {
            mediateurId,
          },
        },
      },
    },
    select: {
      id: true,
      nom: true,
      description: true,
      departement: true,
      mediateurId: true,
      coordinateurId: true,
    },
    orderBy: { nom: 'asc' },
  })

  return tags.map((tag) => ({
    ...tag,
    scope: getTagScope(tag),
  }))
}
