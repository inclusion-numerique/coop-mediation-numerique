import { prismaClient } from '@app/web/prismaClient'
import { TagScope } from '../tagScope'

export const getMediateursTags = async ({
  mediateurIds,
  departement,
}: {
  mediateurIds: string[]
  departement?: string
}) => {
  const tags = await prismaClient.tag.findMany({
    where: {
      OR: [
        { mediateurId: { in: mediateurIds } },
        departement ? { departement } : {},
      ],
    },
    select: {
      id: true,
      nom: true,
      departement: true,
    },
  })

  return tags.map(({ id, nom, departement }) => ({
    id,
    nom,
    scope: departement ? TagScope.Departemental : TagScope.Personnel,
  }))
}
