import { prismaClient } from '@app/web/prismaClient'
import { TagScope } from '../tagScope'

export const getMediateursTags = async ({
  mediateurId,
  coordinateurId,
  departement,
  equipeCoordinateurIds,
}: {
  mediateurId?: string
  coordinateurId?: string
  departement?: string
  equipeCoordinateurIds?: string[]
}) => {
  const tags = await prismaClient.tag.findMany({
    where: {
      suppression: null,
      OR: [
        ...(mediateurId ? [{ mediateurId }] : []),
        ...(coordinateurId ? [{ coordinateurId, equipe: { not: true } }] : []),
        ...(departement ? [{ departement }] : []),
        ...(equipeCoordinateurIds && equipeCoordinateurIds.length > 0
          ? [{ equipe: true, coordinateurId: { in: equipeCoordinateurIds } }]
          : []),
        {
          mediateurId: null,
          coordinateurId: null,
          departement: null,
          equipe: null,
        },
      ],
    },
    select: {
      id: true,
      nom: true,
      mediateurId: true,
      coordinateurId: true,
      departement: true,
      equipe: true,
    },
  })

  return tags.map(
    ({ id, nom, mediateurId, coordinateurId, departement, equipe }) => ({
      id,
      nom,
      scope: equipe
        ? TagScope.Equipe
        : mediateurId || coordinateurId
          ? TagScope.Personnel
          : departement
            ? TagScope.Departemental
            : TagScope.National,
    }),
  )
}
