import { prismaClient } from '@app/web/prismaClient'
import { TagScope } from '../tagScope'

export const getTagsCollectifs = async () => {
  const tags = await prismaClient.tag.findMany({
    where: {
      mediateurId: null,
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
