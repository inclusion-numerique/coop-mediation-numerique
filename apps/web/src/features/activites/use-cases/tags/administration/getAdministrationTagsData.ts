import { TagScope } from '@app/web/features/activites/use-cases/tags/tagScope'
import { prismaClient } from '@app/web/prismaClient'

const getTagsCreators = async () => {
  const tagCreators = await prismaClient.tag.findMany({
    where: {
      activites: {
        some: {},
      },
      mediateurId: {
        not: null,
      },
    },
    select: {
      mediateurId: true,
    },
    distinct: ['mediateurId'],
  })

  const total = tagCreators.length

  const totalMediators = await prismaClient.mediateur.count()

  const percentage = totalMediators
    ? Math.round((total / totalMediators) * 100)
    : 0

  return { total, percentage }
}

const getTagUsedInCRAs = async () => {
  const distinctActivitesWithTags = await prismaClient.activitesTags.findMany({
    select: {
      activiteId: true,
    },
    distinct: ['activiteId'],
  })

  const total = distinctActivitesWithTags.length

  const totalActivites = await prismaClient.activite.count()

  const percentage = totalActivites
    ? Math.round((total / totalActivites) * 100)
    : 0

  return { total, percentage }
}

const getMostUsedTags = async () => {
  const mostUsedTagsRaw = await prismaClient.activitesTags.groupBy({
    by: ['tagId'],
    _count: { tagId: true },
    orderBy: {
      _count: {
        tagId: 'desc',
      },
    },
    take: 30,
  })

  const mostUsedTags = await prismaClient.tag.findMany({
    where: {
      id: {
        in: mostUsedTagsRaw.map(({ tagId }) => tagId),
      },
    },
  })

  return mostUsedTags.map(({ id, nom, description, departement }) => ({
    id,
    nom,
    scope: departement ? TagScope.Departemental : TagScope.Personnel,
    description: description ?? undefined,
  }))
}

export const getAdministrationTagsData = async () => ({
  tagsCreators: await getTagsCreators(),
  tagsUsedInCRAs: await getTagUsedInCRAs(),
  mostUsedTags: await getMostUsedTags(),
})
