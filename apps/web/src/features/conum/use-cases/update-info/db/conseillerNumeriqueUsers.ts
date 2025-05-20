import { prismaClient } from '@app/web/prismaClient'

export const conseillerNumeriqueUsers = async () =>
  prismaClient.user.findMany({
    where: { mediateur: { conseillerNumerique: { isNot: null } } },
    include: { mediateur: { include: { conseillerNumerique: true } } },
  })
