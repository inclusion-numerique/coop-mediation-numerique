import { prismaClient } from '@app/web/prismaClient'

export const deleteFromArchive = async ({
  mediateurId,
  coordinateurId,
}: {
  mediateurId: string
  coordinateurId: string
}) => {
  const mediateurCoordonne = await prismaClient.mediateurCoordonne.findFirst({
    where: {
      mediateurId,
      coordinateurId,
    },
    select: {
      id: true,
      suppression: true,
    },
  })

  if (mediateurCoordonne == null) {
    throw new Error('Mediateur coordonne not found')
  }

  await prismaClient.mediateurCoordonne.delete({
    where: {
      id: mediateurCoordonne.id,
    },
  })
}
