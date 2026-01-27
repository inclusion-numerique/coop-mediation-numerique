import { prismaClient } from '@app/web/prismaClient'
import { TagScope } from '../tagScope'

export const getMediateursTags = async ({
  mediateurIds,
  departement,
  equipeCoordinateurIds,
}: {
  mediateurIds: string[]
  departement?: string
  equipeCoordinateurIds?: string[]
}) => {
  const tags = await prismaClient.tag.findMany({
    where: {
      OR: [
        { mediateurId: { in: mediateurIds } },
        departement ? { departement } : {},
        ...(equipeCoordinateurIds && equipeCoordinateurIds.length > 0
          ? [{ equipe: true, coordinateurId: { in: equipeCoordinateurIds } }]
          : []),
      ],
    },
    select: {
      id: true,
      nom: true,
      departement: true,
      equipe: true,
    },
  })

  return tags.map(({ id, nom, departement, equipe }) => ({
    id,
    nom,
    scope: equipe
      ? TagScope.Equipe
      : departement
        ? TagScope.Departemental
        : TagScope.Personnel,
  }))
}
