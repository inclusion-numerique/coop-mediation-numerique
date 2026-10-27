import { getTagScope } from '@app/web/features/activites/use-cases/tags/tagScope'
import { prismaClient } from '@app/web/prismaClient'
import { orderItemsByIndexedValues } from '@app/web/utils/orderItemsByIndexedValues'
import type { Proportion, TagLePlusUtilise, UsageDesTags } from '../../domain'

const NOMBRE_DE_TAGS_LES_PLUS_UTILISES = 300

const proportion = (total: number, ensemble: number): Proportion => ({
  total,
  percentage: ensemble ? Math.round((total / ensemble) * 100) : 0,
})

const createursDeTagsUtilises = async (): Promise<Proportion> => {
  const [createurs, mediateurs] = await Promise.all([
    prismaClient.tag.findMany({
      where: { activites: { some: {} }, mediateurId: { not: null } },
      select: { mediateurId: true },
      distinct: ['mediateurId'],
    }),
    prismaClient.mediateur.count(),
  ])

  return proportion(createurs.length, mediateurs)
}

const activitesAvecTag = async (): Promise<Proportion> => {
  const [activitesTaguees, activites] = await Promise.all([
    prismaClient.activitesTags.findMany({
      select: { activiteId: true },
      distinct: ['activiteId'],
    }),
    prismaClient.activite.count(),
  ])

  return proportion(activitesTaguees.length, activites)
}

const tagsLesPlusUtilises = async (): Promise<TagLePlusUtilise[]> => {
  const usages = await prismaClient.activitesTags.groupBy({
    by: ['tagId'],
    _count: { tagId: true },
    orderBy: { _count: { tagId: 'desc' } },
    take: NOMBRE_DE_TAGS_LES_PLUS_UTILISES,
  })

  const idsOrdonnes = usages.map(({ tagId }) => tagId)
  const usageParTag = new Map(
    usages.map(({ tagId, _count }) => [tagId, _count.tagId]),
  )

  const tags = await prismaClient.tag.findMany({
    where: { id: { in: idsOrdonnes } },
    select: {
      id: true,
      nom: true,
      description: true,
      mediateurId: true,
      coordinateurId: true,
      departement: true,
      equipe: true,
      activites: {
        select: { activite: { select: { accompagnementsCount: true } } },
      },
      _count: { select: { activitesCoordinationTags: true } },
    },
  })

  return orderItemsByIndexedValues(tags, idsOrdonnes).map((tag) => ({
    id: tag.id,
    nom: tag.nom,
    scope: getTagScope(tag),
    description: tag.description ?? undefined,
    usageCount: usageParTag.get(tag.id) ?? 0,
    accompagnementsCount:
      tag.activites.reduce(
        (total, { activite }) => total + activite.accompagnementsCount,
        0,
      ) + tag._count.activitesCoordinationTags,
  }))
}

export const usageDesTags = async (): Promise<UsageDesTags> => {
  const [tagsCreators, tagsUsedInCRAs, mostUsedTags] = await Promise.all([
    createursDeTagsUtilises(),
    activitesAvecTag(),
    tagsLesPlusUtilises(),
  ])

  return { tagsCreators, tagsUsedInCRAs, mostUsedTags }
}
