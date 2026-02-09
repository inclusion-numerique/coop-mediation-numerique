import { getTagScope } from '@app/web/features/activites/use-cases/tags/tagScope'
import { prismaClient } from '@app/web/prismaClient'
import { orderItemsByIndexedValues } from '@app/web/utils/orderItemsByIndexedValues'

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
    take: 300,
  })

  const orderedTagIds = mostUsedTagsRaw.map(({ tagId }) => tagId)

  const countsById = new Map(
    mostUsedTagsRaw.map(({ tagId, _count }) => [tagId, _count.tagId]),
  )

  const mostUsedTagsUnsorted = await prismaClient.tag.findMany({
    where: {
      id: {
        in: mostUsedTagsRaw.map(({ tagId }) => tagId),
      },
    },
    select: {
      id: true,
      nom: true,
      description: true,
      mediateurId: true,
      coordinateurId: true,
      departement: true,
      equipe: true,
      activites: {
        include: {
          activite: {
            select: {
              accompagnementsCount: true,
            },
          },
        },
      },
    },
  })

  const mostUsedTags = orderItemsByIndexedValues(
    mostUsedTagsUnsorted,
    orderedTagIds,
  )

  return mostUsedTags.map((tag) => {
    const accompagnementsCount = tag.activites.reduce(
      (acc, { activite }) => acc + activite.accompagnementsCount,
      0,
    )
    return {
      id: tag.id,
      nom: tag.nom,
      scope: getTagScope(tag),
      description: tag.description ?? undefined,
      usageCount: countsById.get(tag.id) ?? 0,
      accompagnementsCount,
    }
  })
}

export const getAdministrationTagsData = async () => ({
  tagsCreators: await getTagsCreators(),
  tagsUsedInCRAs: await getTagUsedInCRAs(),
  mostUsedTags: await getMostUsedTags(),
})
