import { prismaClient } from '@app/web/prismaClient'

export const retirerDesLieux = async ({
  mediateurId,
}: {
  readonly mediateurId: string
}): Promise<{ readonly rattachementsSupprimes: number }> => {
  const { count } = await prismaClient.mediateurEnActivite.deleteMany({
    where: { mediateurId },
  })

  return { rattachementsSupprimes: count }
}
