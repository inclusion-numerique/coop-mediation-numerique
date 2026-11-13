import { TagScope } from '@app/web/features/statistiques/ui/filtres/portee-de-tag'
import { prismaClient } from '@app/web/prismaClient'

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
