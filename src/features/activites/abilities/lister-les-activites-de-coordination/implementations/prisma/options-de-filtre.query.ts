import { prismaClient } from '@/configuration/prisma'
import { type CoordinateurId, NomDeTag, TagId } from '../../../../domain'
import type { OptionsDeFiltre } from '../../domain'

const TAGS_LES_PLUS_UTILISES = 10

export const optionsDeFiltre = async ({
  coordinateurId,
}: {
  coordinateurId: CoordinateurId
}): Promise<OptionsDeFiltre> => {
  const deLaCoordination = { coordinateurId, suppression: null }
  const [tags, bornes] = await Promise.all([
    prismaClient.tag.findMany({
      where: {
        activitesCoordinationTags: {
          some: { activiteCoordination: deLaCoordination },
        },
      },
      select: {
        id: true,
        nom: true,
      },
      orderBy: [
        { activitesCoordinationTags: { _count: 'desc' } },
        { nom: 'asc' },
      ],
      take: TAGS_LES_PLUS_UTILISES,
    }),
    prismaClient.activiteCoordination.aggregate({
      _min: { date: true },
      _max: { date: true },
      where: deLaCoordination,
    }),
  ])

  return {
    tags: tags.flatMap((tag) => {
      const nom = NomDeTag.safe(tag.nom)
      return nom === null ? [] : [{ id: TagId(tag.id), nom }]
    }),
    periodeCouverte:
      bornes._min.date === null || bornes._max.date === null
        ? null
        : { du: bornes._min.date, au: bornes._max.date },
  }
}
