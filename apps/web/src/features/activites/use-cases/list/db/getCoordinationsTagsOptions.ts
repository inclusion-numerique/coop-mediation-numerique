import { CoordinateurUser } from '@app/web/auth/userTypeGuards'
import { prismaClient } from '@app/web/prismaClient'
import { getTagScope } from '../../tags/tagScope'

export const getCoordinationsTagsOptions = async ({
  user,
}: {
  user: CoordinateurUser
}) => {
  const tags = await prismaClient.tag.findMany({
    where: {
      ActivitesCoordinationTags: {
        some: {
          activiteCoordination: {
            coordinateurId: user.coordinateur.id,
            suppression: null,
          },
        },
      },
    },
    select: {
      id: true,
      nom: true,
      mediateurId: true,
      coordinateurId: true,
      departement: true,
    },
    distinct: ['id'],
    orderBy: { nom: 'asc' },
  })

  return tags.map((tag) => ({
    value: tag.id,
    label: tag.nom,
    scope: getTagScope(tag),
  }))
}
