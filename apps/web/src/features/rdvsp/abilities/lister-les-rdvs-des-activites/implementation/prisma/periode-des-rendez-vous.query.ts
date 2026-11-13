import { prismaClient } from '@app/web/prismaClient'

export type PeriodeDesRendezVous = {
  readonly first: Date | undefined
  readonly last: Date | undefined
}

export const periodeDesRendezVous = async ({
  comptes,
}: {
  readonly comptes: readonly number[]
}): Promise<PeriodeDesRendezVous> => {
  if (comptes.length === 0) return { first: undefined, last: undefined }

  const bornes = await prismaClient.rdv.aggregate({
    _min: { startsAt: true },
    _max: { startsAt: true },
    where: { rdvAccountId: { in: [...comptes] } },
  })

  return {
    first: bornes._min.startsAt ?? undefined,
    last: bornes._max.startsAt ?? undefined,
  }
}
