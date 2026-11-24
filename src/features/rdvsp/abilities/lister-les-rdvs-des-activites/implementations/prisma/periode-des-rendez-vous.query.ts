import { prismaClient } from '@/configuration/prisma/prisma-client'

export type PeriodeDesRendezVous = {
  readonly first?: Date
  readonly last?: Date
}

export const periodeDesRendezVous = async ({
  comptes,
}: {
  readonly comptes: readonly number[]
}): Promise<PeriodeDesRendezVous> => {
  if (comptes.length === 0) return {}

  const bornes = await prismaClient.rdv.aggregate({
    _min: { startsAt: true },
    _max: { startsAt: true },
    where: { rdvAccountId: { in: [...comptes] } },
  })

  return {
    ...(bornes._min.startsAt === null ? {} : { first: bornes._min.startsAt }),
    ...(bornes._max.startsAt === null ? {} : { last: bornes._max.startsAt }),
  }
}
