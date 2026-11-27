import { prismaClient } from '@/configuration/prisma'
import type { TerminerLeRattachement } from '../../domain/ports'

export const terminerLeRattachement: TerminerLeRattachement = async ({
  id,
  par,
  maintenant,
}) => {
  await prismaClient.mediateurEnActivite.update({
    where: { id },
    data: {
      fin: maintenant,
      modification: maintenant,
      derniereModificationParId: par,
    },
  })
}
